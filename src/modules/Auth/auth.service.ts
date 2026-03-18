import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { User, UserDocument } from '../../DB/models/user.model';
import { SignupDto } from './dto/signup.dto';
import { ConfirmOtpDto } from './dto/confirm-otp.dto';
import { SigninDto } from './dto/signin.dto';
import { GoogleSignupDto, GoogleLoginDto } from './dto/google.dto';
import { ForgetPasswordDto } from './dto/forget-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import {
  generateToken,
  verifyToken,
} from '../../common/utils/token/token.util';
import { OTPTypes, Providers } from '../../common/enums/enums';
import { hash, compare } from '../../common/utils/encryption/hash';
import { generateOtp } from '../../common/utils/generateOTP/otp.generate';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private configService: ConfigService,
  ) {}

  async signUp(signupDto: SignupDto) {
    const { email, password, DOB, ...rest } = signupDto;

    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    if (DOB) {
      const birthDate = new Date(DOB);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }
      if (age < 18) {
        throw new BadRequestException('Age must be greater than 18');
      }
    }

    const otpCode = generateOtp();
    const salt = Number(this.configService.get<string>('SALT'));
    const hashedOtp = await hash(otpCode, salt);

    const newUser = new this.userModel({
      email,
      password,
      DOB,
      ...rest,
      provider: Providers.SYSTEM,
      isConfirmed: false,
      OTP: [
        {
          code: hashedOtp,
          type: OTPTypes.CONFIRM_EMAIL,
          expiresIn: new Date(Date.now() + 10 * 60 * 1000),
        },
      ],
    });

    (newUser as typeof newUser & { _otpCode?: string })._otpCode = otpCode;
    await newUser.save();

    return { message: 'Verification email sent' };
  }

  async confirmOtp(confirmOtpDto: ConfirmOtpDto) {
    const { email, otpCode } = confirmOtpDto;
    const user = await this.userModel.findOne({ email }).select('+OTP');
    if (!user) throw new NotFoundException('User not found');

    if (!user.OTP || user.OTP.length === 0) {
      throw new BadRequestException('No OTP codes found for this user');
    }

    const otpIndex = user.OTP.findIndex(
      (otp) => otp.type === OTPTypes.CONFIRM_EMAIL,
    );
    if (otpIndex === -1)
      throw new BadRequestException('No confirm email OTP found');

    const otpData = user.OTP[otpIndex];

    if (new Date() > otpData.expiresIn) {
      throw new BadRequestException('OTP has expired');
    }

    const isMatched = await compare(otpCode, otpData.code);
    if (!isMatched) {
      throw new BadRequestException('Invalid OTP');
    }

    user.isConfirmed = true;
    user.OTP.splice(otpIndex, 1);
    await user.save();

    return { message: 'Email confirmed successfully' };
  }

  async signIn(signinDto: SigninDto) {
    const { email, password } = signinDto;
    const user = await this.userModel.findOne({ email });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    if (!user.password) {
      throw new UnauthorizedException('Please use social login');
    }

    if (user.provider !== Providers.SYSTEM) {
      throw new UnauthorizedException('Please login with your provider');
    }
    if (!user.isConfirmed) {
      throw new UnauthorizedException('Please confirm your email first');
    }

    const isPasswordValid = await compare(password, user.password);
    if (!isPasswordValid)
      throw new UnauthorizedException('Invalid credentials');

    const accessToken = generateToken({
      payload: { _id: user._id, role: user.role },
      signature: this.configService.get<string>('ACCESS_TOKEN_SECRET'),
      options: {
        expiresIn: this.configService.get<string>(
          'ACCESS_TOKEN_EXPIRES',
        ) as any,
      },
    });
    const refreshToken = generateToken({
      payload: { _id: user._id, role: user.role },
      signature: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
      options: {
        expiresIn: this.configService.get<string>(
          'REFRESH_TOKEN_EXPIRES',
        ) as any,
      },
    });

    return { accessToken, refreshToken };
  }

  async signupWithGoogle(googleSignupDto: GoogleSignupDto) {
    const existingUser = await this.userModel.findOne({
      email: googleSignupDto.email,
    });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const newUser = new this.userModel({
      ...googleSignupDto,
      provider: Providers.GOOGLE,
      isConfirmed: true,
    });

    await newUser.save();
    return { message: 'User created successfully with Google' };
  }

  async loginWithGoogle(googleLoginDto: GoogleLoginDto) {
    const user = await this.userModel.findOne({ email: googleLoginDto.email });
    if (!user) throw new NotFoundException('User not found');
    if (user.provider !== Providers.GOOGLE) {
      throw new UnauthorizedException(
        'Please login with your system credentials',
      );
    }

    const accessToken = generateToken({
      payload: { _id: user._id, role: user.role },
      signature: this.configService.get<string>('ACCESS_TOKEN_SECRET'),
      options: {
        expiresIn: this.configService.get<string>(
          'ACCESS_TOKEN_EXPIRES',
        ) as any,
      },
    });
    const refreshToken = generateToken({
      payload: { _id: user._id, role: user.role },
      signature: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
      options: {
        expiresIn: this.configService.get<string>(
          'REFRESH_TOKEN_EXPIRES',
        ) as any,
      },
    });

    return { accessToken, refreshToken };
  }

  async forgetPassword(forgetPasswordDto: ForgetPasswordDto) {
    const { email } = forgetPasswordDto;
    const user = await this.userModel.findOne({ email }).select('+OTP');
    if (!user) throw new NotFoundException('User not found');

    const otpCode = generateOtp();
    const salt = Number(this.configService.get<string>('SALT'));
    const hashedOtp = await hash(otpCode, salt);

    user.OTP = user.OTP.filter((otp) => otp.type !== OTPTypes.FORGET_PASSWORD);

    user.OTP.push({
      code: hashedOtp,
      type: OTPTypes.FORGET_PASSWORD,
      expiresIn: new Date(Date.now() + 10 * 60 * 1000),
    });

    (user as typeof user & { _otpCode?: string })._otpCode = otpCode;
    await user.save();

    return { message: 'OTP sent successfully to your email.' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { email, otpCode, newPassword } = resetPasswordDto;
    const user = await this.userModel.findOne({ email }).select('+OTP');
    if (!user) throw new NotFoundException('User not found');

    const otpIndex = user.OTP.findIndex(
      (otp) => otp.type === OTPTypes.FORGET_PASSWORD,
    );
    if (otpIndex === -1)
      throw new BadRequestException('No forget password OTP found');

    const otpData = user.OTP[otpIndex];

    if (new Date() > otpData.expiresIn) {
      throw new BadRequestException('OTP has expired');
    }

    const isMatched = await compare(otpCode, otpData.code);
    if (!isMatched) {
      throw new BadRequestException('Invalid OTP');
    }

    user.password = newPassword;
    user.changeCredentialTime = new Date();
    user.OTP.splice(otpIndex, 1);

    await user.save();
    return { message: 'Password reset successfully' };
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    const decoded = verifyToken({
      token: refreshTokenDto.refreshToken,
      signature: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
    }) as {
      _id: string;
      role: string;
      iat: number;
    };

    if (!decoded) throw new UnauthorizedException('Invalid token');
    const user = await this.userModel.findById(decoded._id);

    if (!user) throw new UnauthorizedException('Invalid token');

    if (user.changeCredentialTime) {
      const changeTime = parseInt(
        (user.changeCredentialTime.getTime() / 1000).toString(),
        10,
      );
      if (decoded.iat < changeTime) {
        throw new UnauthorizedException('Token expired due to password change');
      }
    }

    const accessToken = generateToken({
      payload: { _id: user._id, role: user.role },
      signature: this.configService.get<string>('ACCESS_TOKEN_SECRET'),
      options: {
        expiresIn: this.configService.get<string>(
          'ACCESS_TOKEN_EXPIRES',
        ) as any,
      },
    });

    return { accessToken };
  }

  async resendOtp(resendOtpDto: ResendOtpDto) {
    const { email, type } = resendOtpDto;
    const user = await this.userModel.findOne({ email }).select('+OTP');
    if (!user) throw new NotFoundException('User not found');

    if (type === OTPTypes.CONFIRM_EMAIL && user.isConfirmed) {
      throw new BadRequestException('User is already confirmed');
    }

    const otpCode = generateOtp();
    const salt = Number(this.configService.get<string>('SALT'));
    const hashedOtp = await hash(otpCode, salt);

    user.OTP = user.OTP.filter((otp) => otp.type !== type);

    user.OTP.push({
      code: hashedOtp,
      type,
      expiresIn: new Date(Date.now() + 10 * 60 * 1000),
    });

    (user as typeof user & { _otpCode?: string })._otpCode = otpCode;
    await user.save();

    return { message: 'OTP resent successfully to your email' };
  }

  async updatePassword(userId: string, updatePasswordDto: UpdatePasswordDto) {
    const { oldPassword, newPassword } = updatePasswordDto;
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.provider !== Providers.SYSTEM || !user.password) {
      throw new BadRequestException(
        'Cannot update password for non-system accounts',
      );
    }

    const isPasswordValid = await compare(oldPassword, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid old password');
    }

    user.password = newPassword;
    user.changeCredentialTime = new Date();

    await user.save();
    return { message: 'Password updated successfully' };
  }
}
