import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ApplicationService } from './application.service';
import { ApplicationController } from './application.controller';
import {
  Application,
  ApplicationSchema,
} from '../../DB/models/application.model';
import { Job, JobSchema } from '../../DB/models/job.model';
import { Company, CompanySchema } from '../../DB/models/company.model';
import { SocketModule } from '../Socket/socket.module';
import { EmailModule } from '../../common/services/email.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Application.name, schema: ApplicationSchema },
      { name: Job.name, schema: JobSchema },
      { name: Company.name, schema: CompanySchema },
    ]),
    SocketModule,
    EmailModule,
  ],
  controllers: [ApplicationController],
  providers: [ApplicationService],
})
export class ApplicationModule {}
