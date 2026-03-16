import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Job, JobDocument } from '../../DB/models/job.model';
import { Company, CompanyDocument } from '../../DB/models/company.model';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';

import { JobQueryDto } from './dto/job-query.dto';

@Injectable()
export class JobService {
  constructor(
    @InjectModel(Job.name) private jobModel: Model<JobDocument>,
    @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
  ) {}

  async addJob(createJobDto: CreateJobDto, userId: string) {
    const company = await this.companyModel.findById(createJobDto.companyId);
    if (!company) throw new NotFoundException('Company not found');

    const isOwner = company.CreatedBy.toString() === userId.toString();
    const isHR = company.HRs.some(
      (hrId) => hrId.toString() === userId.toString(),
    );

    if (!isOwner && !isHR) {
      throw new ForbiddenException(
        'Only the owner or an HR of this company can add a job',
      );
    }

    const job = new this.jobModel({
      ...createJobDto,
      addedBy: userId,
    });

    return await job.save();
  }

  async updateJob(id: string, updateJobDto: UpdateJobDto, userId: string) {
    const job = await this.jobModel.findById(id).populate('companyId');
    if (!job) throw new NotFoundException('Job not found');

    const company = job.companyId as unknown as CompanyDocument;
    if (company.CreatedBy.toString() !== userId.toString()) {
      throw new ForbiddenException(
        'ONLY the company Owner can update this job',
      );
    }

    Object.assign(job, updateJobDto);
    return await job.save();
  }

  async deleteJob(id: string, userId: string) {
    const job = await this.jobModel.findById(id).populate('companyId');
    if (!job) throw new NotFoundException('Job not found');

    const company = job.companyId as unknown as CompanyDocument;
    const isHR = company.HRs.some(
      (hrId) => hrId.toString() === userId.toString(),
    );

    if (!isHR) {
      throw new ForbiddenException('ONLY a company HR can delete this job');
    }

    await job.deleteOne();
    return { message: 'Job deleted successfully' };
  }

  async getCompanyJobs(
    companyId: string,
    jobId?: string,
    query: JobQueryDto = {},
  ) {
    const { skip = 0, limit = 10, sort = '-createdAt', companyName } = query;

    const filter: Record<string, any> = {
      companyId: new Types.ObjectId(companyId),
    };
    if (jobId) {
      filter._id = new Types.ObjectId(jobId);
    }

    if (companyName) {
      const company = await this.companyModel.findOne({
        _id: companyId,
        companyName: { $regex: companyName, $options: 'i' },
      });
      if (!company) return { data: [], totalCount: 0, skip, limit };
    }

    const [data, totalCount] = await Promise.all([
      this.jobModel
        .find(filter)
        .sort(sort as string)
        .skip(Number(skip))
        .limit(Number(limit)),
      this.jobModel.countDocuments(filter),
    ]);

    return { data, totalCount, skip, limit };
  }

  async getAllJobs(query: JobQueryDto) {
    const {
      skip = 0,
      limit = 10,
      sort = '-createdAt',
      workingTime,
      jobLocation,
      seniorityLevel,
      jobTitle,
      technicalSkills,
    } = query;

    const filter: Record<string, any> = {};
    if (workingTime) filter.workingTime = workingTime;
    if (jobLocation) filter.jobLocation = jobLocation;
    if (seniorityLevel) filter.seniorityLevel = seniorityLevel;
    if (jobTitle) filter.jobTitle = { $regex: jobTitle, $options: 'i' };
    if (technicalSkills) {
      const skills = technicalSkills.split(',');
      filter.technicalSkills = { $in: skills };
    }

    const [data, totalCount] = await Promise.all([
      this.jobModel
        .find(filter)
        .sort(sort as string)
        .skip(Number(skip))
        .limit(Number(limit)),
      this.jobModel.countDocuments(filter),
    ]);

    return { data, totalCount, skip, limit };
  }
}
