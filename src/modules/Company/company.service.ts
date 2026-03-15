import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Company, CompanyDocument } from '../../DB/models/company.model';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { Roles } from '../../common/enums/enums';

@Injectable()
export class CompanyService {
  constructor(
    @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
    private configService: ConfigService,
  ) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  async createCompany(createCompanyDto: CreateCompanyDto, userId: string) {
    const { companyName, companyEmail } = createCompanyDto;
    const existingCompany = await this.companyModel.findOne({
      $or: [{ companyName }, { companyEmail }],
    });

    if (existingCompany) {
      throw new ConflictException('Company name or email already exists');
    }

    const company = new this.companyModel({
      ...createCompanyDto,
      CreatedBy: userId,
    });

    return await company.save();
  }

  async updateCompany(
    id: string,
    updateCompanyDto: UpdateCompanyDto,
    userId: string,
  ) {
    const company = await this.companyModel.findById(id);
    if (!company) throw new NotFoundException('Company not found');

    if (company.CreatedBy.toString() !== userId) {
      throw new ForbiddenException('Only the owner can update company data');
    }

    Object.assign(company, updateCompanyDto);
    return await company.save();
  }

  async softDeleteCompany(id: string, userId: string, userRole: string) {
    const company = await this.companyModel.findById(id);
    if (!company) throw new NotFoundException('Company not found');

    if (company.CreatedBy.toString() !== userId && userRole !== Roles.ADMIN) {
      throw new ForbiddenException(
        'Only the owner or admin can delete the company',
      );
    }

    company.deletedAt = new Date();
    await company.save();
    return { message: 'Company soft deleted successfully' };
  }

  async getCompanyWithJobs(id: string) {
    const company = await this.companyModel.findById(id).populate('jobs');
    if (!company) throw new NotFoundException('Company not found');
    return { company };
  }

  async searchCompany(companyName: string) {
    const companies = await this.companyModel.find({
      companyName: { $regex: companyName, $options: 'i' },
    });
    return { companies };
  }

  async uploadLogo(id: string, userId: string, file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file provided');
    const company = await this.companyModel.findById(id);
    if (!company) throw new NotFoundException('Company not found');

    if (company.CreatedBy.toString() !== userId) {
      throw new ForbiddenException('Only the owner can manage the logo');
    }

    const b64 = Buffer.from(file.buffer).toString('base64');
    const dataURI = `data:${file.mimetype};base64,${b64}`;

    if (company.Logo?.public_id) {
      await cloudinary.uploader.destroy(company.Logo.public_id);
    }

    const uploadResult = await cloudinary.uploader.upload(dataURI, {
      folder: 'job-search/company/logo',
    });

    company.Logo = {
      secure_url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
    };

    await company.save();
    return { message: 'Logo uploaded successfully', Logo: company.Logo };
  }

  async deleteLogo(id: string, userId: string) {
    const company = await this.companyModel.findById(id);
    if (!company) throw new NotFoundException('Company not found');

    if (company.CreatedBy.toString() !== userId) {
      throw new ForbiddenException('Only the owner can manage the logo');
    }

    if (company.Logo?.public_id) {
      await cloudinary.uploader.destroy(company.Logo.public_id);
      company.Logo = undefined;
      await company.save();
    }
    return { message: 'Logo deleted successfully' };
  }

  async uploadCover(id: string, userId: string, file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file provided');
    const company = await this.companyModel.findById(id);
    if (!company) throw new NotFoundException('Company not found');

    if (company.CreatedBy.toString() !== userId) {
      throw new ForbiddenException(
        'Only the owner can manage the cover picture',
      );
    }

    const b64 = Buffer.from(file.buffer).toString('base64');
    const dataURI = `data:${file.mimetype};base64,${b64}`;

    if (company.coverPic?.public_id) {
      await cloudinary.uploader.destroy(company.coverPic.public_id);
    }

    const uploadResult = await cloudinary.uploader.upload(dataURI, {
      folder: 'job-search/company/cover',
    });

    company.coverPic = {
      secure_url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
    };

    await company.save();
    return {
      message: 'Cover picture uploaded successfully',
      coverPic: company.coverPic,
    };
  }

  async deleteCover(id: string, userId: string) {
    const company = await this.companyModel.findById(id);
    if (!company) throw new NotFoundException('Company not found');

    if (company.CreatedBy.toString() !== userId) {
      throw new ForbiddenException(
        'Only the owner can manage the cover picture',
      );
    }

    if (company.coverPic?.public_id) {
      await cloudinary.uploader.destroy(company.coverPic.public_id);
      company.coverPic = undefined;
      await company.save();
    }
    return { message: 'Cover picture deleted successfully' };
  }
}
