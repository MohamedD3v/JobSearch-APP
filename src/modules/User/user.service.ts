import {
  Injectable,
  NotFoundException,
  BadRequestException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../../DB/models/user.model';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CloudinaryService } from '../../common/services/cloudinary.service';

@Injectable()
export class UserService implements OnModuleInit {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private cloudinaryService: CloudinaryService,
  ) {}

  async onModuleInit() {}

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

    if (user.profilePic?.public_id) {
      await this.cloudinaryService.deleteFile(user.profilePic.public_id);
    }

    const uploadResult = await this.cloudinaryService.uploadFile(
      file,
      'profile',
    );
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
      await this.cloudinaryService.deleteFile(user.profilePic.public_id);
      user.profilePic = undefined;
      await user.save();
    }
    return { message: 'Profile picture deleted successfully' };
  }

  async uploadCoverPic(userId: string, file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file provided');
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    if (user.coverPic?.public_id) {
      await this.cloudinaryService.deleteFile(user.coverPic.public_id);
    }

    const uploadResult = await this.cloudinaryService.uploadFile(file, 'cover');
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
      await this.cloudinaryService.deleteFile(user.coverPic.public_id);
      user.coverPic = undefined;
      await user.save();
    }
    return { message: 'Cover picture deleted successfully' };
  }
}
