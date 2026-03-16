import {
  Controller,
  Post,
  Patch,
  Delete,
  Get,
  Param,
  Body,
  UseGuards,
  Query,
  Req,
} from '@nestjs/common';
import { JobService } from './job.service';
import { JobQueryDto } from './dto/job-query.dto';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { ParseMongoIdPipe } from '../../common/pipes/parse-mongo-id.pipe';

@Controller('jobs')
export class JobController {
  constructor(private readonly jobService: JobService) {}

  @Post()
  @UseGuards(AuthGuard)
  addJob(@Body() createJobDto: CreateJobDto, @Req() req: any) {
    return this.jobService.addJob(createJobDto, req.user._id as string);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  updateJob(
    @Param('id', ParseMongoIdPipe) id: string,
    @Body() updateJobDto: UpdateJobDto,
    @Req() req: any,
  ) {
    return this.jobService.updateJob(id, updateJobDto, req.user._id as string);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  deleteJob(@Param('id', ParseMongoIdPipe) id: string, @Req() req: any) {
    return this.jobService.deleteJob(id, req.user._id as string);
  }

  @Get('company/:companyId')
  getCompanyJobs(
    @Param('companyId', ParseMongoIdPipe) companyId: string,
    @Query() query: JobQueryDto,
  ) {
    return this.jobService.getCompanyJobs(companyId, undefined, query);
  }

  @Get('company/:companyId/:jobId')
  getSpecificCompanyJob(
    @Param('companyId', ParseMongoIdPipe) companyId: string,
    @Param('jobId', ParseMongoIdPipe) jobId: string,
    @Query() query: JobQueryDto,
  ) {
    return this.jobService.getCompanyJobs(companyId, jobId, query);
  }

  @Get()
  getAllJobs(@Query() query: JobQueryDto) {
    return this.jobService.getAllJobs(query);
  }
}
