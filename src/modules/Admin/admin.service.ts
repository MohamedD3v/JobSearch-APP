import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../DB/models/user.model';
import { Company, CompanyDocument } from '../../DB/models/company.model';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
  ) {}

  async toggleUserBan(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    user.bannedAt = user.bannedAt ? null : new Date();
    await user.save();
    return user;
  }

  async toggleCompanyBan(companyId: string) {
    const company = await this.companyModel.findById(companyId);
    if (!company) throw new NotFoundException('Company not found');

    company.bannedAt = company.bannedAt ? null : new Date();
    await company.save();
    return company;
  }

  async approveCompany(companyId: string) {
    const company = await this.companyModel.findById(companyId);
    if (!company) throw new NotFoundException('Company not found');

    company.isApproved = true;
    await company.save();
    return company;
  }

  async getDashboardData() {
    const [users, companies] = await Promise.all([
      this.userModel.find(),
      this.companyModel.find(),
    ]);
    return { users, companies };
  }
}
