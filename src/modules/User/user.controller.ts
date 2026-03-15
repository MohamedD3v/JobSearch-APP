import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  Req,
  Param,
  UseGuards,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileUploadInterceptor } from '../../common/interceptors/file-upload.interceptor';
import { UserService } from './user.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { ParseMongoIdPipe } from '../../common/pipes/parse-mongo-id.pipe';
import { Types } from 'mongoose';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthGuard)
  @Get('profile')
  async getProfile(@Req() req: any) {
    return this.userService.getProfile(req.user._id as string);
  }

  @UseGuards(AuthGuard)
  @Patch('profile')
  async updateProfile(
    @Req() req: any,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.userService.updateProfile(
      req.user._id as string,
      updateProfileDto,
    );
  }

  @Get('profile/:id')
  async getPublicProfile(@Param('id', ParseMongoIdPipe) id: Types.ObjectId) {
    return this.userService.getPublicProfile(id);
  }

  @UseGuards(AuthGuard)
  @Delete('account')
  async softDeleteAccount(@Req() req: any) {
    return this.userService.softDeleteAccount(req.user._id as string);
  }

  @UseGuards(AuthGuard)
  @Post('profile-pic')
  @UseInterceptors(FileUploadInterceptor('file'))
  async uploadProfilePic(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.userService.uploadProfilePic(req.user._id as string, file);
  }

  @UseGuards(AuthGuard)
  @Delete('profile-pic')
  async deleteProfilePic(@Req() req: any) {
    return this.userService.deleteProfilePic(req.user._id as string);
  }

  @UseGuards(AuthGuard)
  @Post('cover-pic')
  @UseInterceptors(FileUploadInterceptor('file'))
  async uploadCoverPic(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.userService.uploadCoverPic(req.user._id as string, file);
  }

  @UseGuards(AuthGuard)
  @Delete('cover-pic')
  async deleteCoverPic(@Req() req: any) {
    return this.userService.deleteCoverPic(req.user._id as string);
  }
}
