import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Application,
  ApplicationDocument,
} from '../../DB/models/application.model';
import { Job, JobDocument } from '../../DB/models/job.model';
import { Company, CompanyDocument } from '../../DB/models/company.model';
import { User } from '../../DB/models/user.model';
import { SocketGateway } from '../Socket/socket.gateway';
import { EmailService } from '../../common/services/email.service';
import { CloudinaryService } from '../../common/services/cloudinary.service';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { ApplicationStatus } from '../../common/enums/enums';

import { PaginationQueryDto } from './dto/pagination-query.dto';

@Injectable()
export class ApplicationService {
  constructor(
    @InjectModel(Application.name)
    private applicationModel: Model<ApplicationDocument>,
    @InjectModel(Job.name) private jobModel: Model<JobDocument>,
    @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
    private socketGateway: SocketGateway,
    private emailService: EmailService,
    private cloudinaryService: CloudinaryService,
  ) {}

  async applyToJob(jobId: string, userId: string, file: Express.Multer.File) {
    if (!file) throw new BadRequestException('CV file is required');

    const job = await this.jobModel.findById(jobId).populate('companyId');
    if (!job) throw new NotFoundException('Job not found');

    const uploadResult = await this.cloudinaryService.uploadFile(file, 'cvs');

    const application = new this.applicationModel({
      jobId,
      userId,
      userCV: {
        secure_url: uploadResult.secure_url,
        public_id: uploadResult.public_id,
      },
    });

    await application.save();

    const company = job.companyId as unknown as CompanyDocument;
    this.socketGateway.emitNewApplication(company._id.toString(), {
      jobTitle: job.jobTitle,
      userId: userId.toString(),
    });

    return { message: 'Application submitted successfully', application };
  }

  async getJobApplications(
    jobId: string,
    userId: string,
    query: PaginationQueryDto,
  ) {
    const job = await this.jobModel.findById(jobId).populate('companyId');
    if (!job) throw new NotFoundException('Job not found');

    const company = job.companyId as unknown as CompanyDocument;
    const isOwner = company.CreatedBy.toString() === userId.toString();
    const isHR = company.HRs.some(
      (hrId) => hrId.toString() === userId.toString(),
    );

    if (!isOwner && !isHR) {
      throw new ForbiddenException(
        'Only Company Owner or HR can access applications',
      );
    }

    const { skip = 0, limit = 10 } = query;

    const [data, totalCount] = await Promise.all([
      this.applicationModel
        .find({ jobId })
        .populate('userId', 'firstName lastName email mobileNumber profilePic')
        .skip(Number(skip))
        .limit(Number(limit)),
      this.applicationModel.countDocuments({ jobId }),
    ]);

    return { data, totalCount, skip, limit };
  }

  async updateApplicationStatus(
    appId: string,
    userId: string,
    updateStatusDto: UpdateApplicationStatusDto,
  ) {
    const application = await this.applicationModel
      .findById(appId)
      .populate({
        path: 'jobId',
        populate: { path: 'companyId' },
      })
      .populate('userId');

    if (!application) throw new NotFoundException('Application not found');

    const job = application.jobId as unknown as JobDocument;
    const company = job.companyId as unknown as CompanyDocument;
    const isHR = company.HRs.some(
      (hrId) => hrId.toString() === userId.toString(),
    );

    if (!isHR) {
      throw new ForbiddenException('Only HR can update application status');
    }

    application.status = updateStatusDto.status;
    await application.save();

    const user = application.userId as unknown as User;
    const userEmail = user.email;
    const subject =
      updateStatusDto.status === ApplicationStatus.ACCEPTED
        ? 'Job Application Accepted'
        : 'Job Application Rejected';

    const html = `
      <h1>Hello ${user.firstName}</h1>
      <p>Your application for the position of <strong>${job.jobTitle}</strong> at <strong>${company.companyName}</strong> has been <strong>${updateStatusDto.status}</strong>.</p>
      <p>Thank you for your interest!</p>
    `;

    await this.emailService.sendEmail(userEmail, subject, html);

    return {
      message: `Application status updated to ${updateStatusDto.status}`,
      application,
    };
  }
}
