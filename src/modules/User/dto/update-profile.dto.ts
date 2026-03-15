import { IsOptional, IsString, IsDateString, IsEnum } from 'class-validator';
import { Genders } from '../../../common/enums/enums';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  mobileNumber?: string;

  @IsOptional()
  @IsDateString()
  DOB?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsEnum(Genders)
  gender?: Genders;
}
