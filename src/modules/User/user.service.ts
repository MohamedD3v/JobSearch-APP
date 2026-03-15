import {
  Injectable,
  NotFoundException,
  BadRequestException,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../../DB/models/user.model';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class UserService implements OnModuleInit {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private configService: ConfigService,
  ) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  async onModuleInit() {
    await this.checkCloudinary();
  }

  async checkCloudinary() {
    try {
      await cloudinary.api.ping();
      console.log('Cloudinary connection: OK');
    } catch (error) {
      console.error('Cloudinary connection error:', error.message);
    }
  }

  async getProfile(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    return { user };
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    Object.assign(user, updateProfileDto);
    await user.save();

    return { message: 'Profile updated successfully', user };
  }

  async getPublicProfile(userId: Types.ObjectId) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    return {
      userName: (user as any).username,
      mobileNumber: user.mobileNumber,
      profilePic: user.profilePic,
      coverPic: user.coverPic,
    };
  }

  async softDeleteAccount(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    user.deletedAt = new Date();
    await user.save();
    return { message: 'Account deleted successfully' };
  }

  async uploadProfilePic(userId: string, file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file provided');
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const b64 = Buffer.from(file.buffer).toString('base64');
    const dataURI = `data:${file.mimetype};base64,${b64}`;

    if (user.profilePic?.public_id) {
      await cloudinary.uploader.destroy(user.profilePic.public_id);
    }

    const uploadResult = await cloudinary.uploader.upload(dataURI, {
      folder: 'job-search/profile',
    });
    user.profilePic = {
      secure_url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
    };
    await user.save();
    return {
      message: 'Profile picture uploaded successfully',
      profilePic: user.profilePic,
    };
  }

  async deleteProfilePic(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    if (user.profilePic?.public_id) {
      await cloudinary.uploader.destroy(user.profilePic.public_id);
      user.profilePic = undefined;
      await user.save();
    }
    return { message: 'Profile picture deleted successfully' };
  }

  async uploadCoverPic(userId: string, file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file provided');
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const b64 = Buffer.from(file.buffer).toString('base64');
    const dataURI = `data:${file.mimetype};base64,${b64}`;

    if (user.coverPic?.public_id) {
      await cloudinary.uploader.destroy(user.coverPic.public_id);
    }

    const uploadResult = await cloudinary.uploader.upload(dataURI, {
      folder: 'job-search/cover',
    });
    user.coverPic = {
      secure_url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
    };
    await user.save();
    return {
      message: 'Cover picture uploaded successfully',
      coverPic: user.coverPic,
    };
  }

  async deleteCoverPic(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    if (user.coverPic?.public_id) {
      await cloudinary.uploader.destroy(user.coverPic.public_id);
      user.coverPic = undefined;
      await user.save();
    }
    return { message: 'Cover picture deleted successfully' };
  }
}
