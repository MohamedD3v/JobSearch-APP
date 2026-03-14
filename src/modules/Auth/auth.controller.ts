import { Controller, Post, Body, UseGuards, Req, Put } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { ConfirmOtpDto } from './dto/confirm-otp.dto';
import { SigninDto } from './dto/signin.dto';
import { GoogleSignupDto, GoogleLoginDto } from './dto/google.dto';
import { ForgetPasswordDto } from './dto/forget-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { AuthGuard } from '../../common/guards/auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(@Body() signupDto: SignupDto) {
    return this.authService.signUp(signupDto);
  }

  @Post('confirm-otp')
  async confirmOtp(@Body() confirmOtpDto: ConfirmOtpDto) {
    return this.authService.confirmOtp(confirmOtpDto);
  }

  @Post('signin')
  async signIn(@Body() signinDto: SigninDto) {
    return this.authService.signIn(signinDto);
  }

  @Post('google-signup')
  async signupWithGoogle(@Body() googleSignupDto: GoogleSignupDto) {
    return this.authService.signupWithGoogle(googleSignupDto);
  }

  @Post('google-login')
  async loginWithGoogle(@Body() googleLoginDto: GoogleLoginDto) {
    return this.authService.loginWithGoogle(googleLoginDto);
  }

  @Post('forget-password')
  async forgetPassword(@Body() forgetPasswordDto: ForgetPasswordDto) {
    return this.authService.forgetPassword(forgetPasswordDto);
  }

  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Post('refresh-token')
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto);
  }

  @Post('resend-otp')
  async resendOtp(@Body() resendOtpDto: ResendOtpDto) {
    return this.authService.resendOtp(resendOtpDto);
  }

  @UseGuards(AuthGuard)
  @Put('update-password')
  async updatePassword(
    @Req() req: any,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    return this.authService.updatePassword(
      req.user._id as string,
      updatePasswordDto,
    );
  }
}
