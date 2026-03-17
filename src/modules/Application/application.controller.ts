import {
  Controller,
  Post,
  Patch,
  Get,
  Param,
  Body,
  UseGuards,
  Query,
  Req,
  UseInterceptors,
  UploadedFile,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApplicationService } from './application.service';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { ParseMongoIdPipe } from '../../common/pipes/parse-mongo-id.pipe';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';

@Controller('jobs')
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  @Post(':jobId/apply')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('cv'))
  applyToJob(
    @Param('jobId', ParseMongoIdPipe) jobId: string,
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.applicationService.applyToJob(
      jobId,
      req.user._id as string,
      file,
    );
  }

  @Get(':jobId/applications')
  @UseGuards(AuthGuard)
  getJobApplications(
    @Param('jobId', ParseMongoIdPipe) jobId: string,
    @Req() req: any,
    @Query() query: PaginationQueryDto,
  ) {
    return this.applicationService.getJobApplications(
      jobId,
      req.user._id as string,
      query,
    );
  }

  @Patch('applications/:appId/status')
  @UseGuards(AuthGuard)
  updateApplicationStatus(
    @Param('appId', ParseMongoIdPipe) appId: string,
    @Req() req: any,
    @Body() updateStatusDto: UpdateApplicationStatusDto,
  ) {
    return this.applicationService.updateApplicationStatus(
      appId,
      req.user._id as string,
      updateStatusDto,
    );
  }

  @Get('applications/excel-export')
  async exportApplicationsToCsv(
    @Query('companyId') companyId: string,
    @Query('date') date: string,
    @Res() res: Response,
  ) {
    const applications = await this.applicationService.getApplicationsForExcel(
      companyId,
      date,
    );

    let csvString = 'Applicant Name,Email,Job Title,Status,Applied At\n';

    applications.forEach((app: any) => {
      const applicantName = `${app.userId.firstName} ${app.userId.lastName}`;
      const email = app.userId.email;
      const jobTitle = app.jobId.jobTitle;
      const status = app.status;
      const appliedAt = app.createdAt.toISOString();

      csvString += `${applicantName},${email},${jobTitle},${status},${appliedAt}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=applications_report.csv',
    );

    return res.status(200).send(csvString);
  }
}
