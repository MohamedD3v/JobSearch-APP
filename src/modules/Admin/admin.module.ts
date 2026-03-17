import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { AdminResolver } from './admin.resolver';
import { User, UserSchema } from '../../DB/models/user.model';
import { Company, CompanySchema } from '../../DB/models/company.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Company.name, schema: CompanySchema },
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService, AdminResolver],
})
export class AdminModule {}
