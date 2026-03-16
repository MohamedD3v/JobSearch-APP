import {
  IsEnum,
  IsNotEmpty,
  IsString,
  IsArray,
  IsMongoId,
} from 'class-validator';
import {
  JobLocation,
  WorkingTime,
  SeniorityLevel,
} from '../../../common/enums/enums';

export class CreateJobDto {
  @IsString()
  @IsNotEmpty()
  jobTitle: string;

  @IsEnum(JobLocation)
  @IsNotEmpty()
  jobLocation: JobLocation;

  @IsEnum(WorkingTime)
  @IsNotEmpty()
  workingTime: WorkingTime;

  @IsEnum(SeniorityLevel)
  @IsNotEmpty()
  seniorityLevel: SeniorityLevel;

  @IsString()
  @IsNotEmpty()
  jobDescription: string;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  technicalSkills: string[];

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  softSkills: string[];

  @IsMongoId()
  @IsNotEmpty()
  companyId: string;
}
