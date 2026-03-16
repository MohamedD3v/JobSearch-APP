import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApplicationStatus } from '../../../common/enums/enums';

export class UpdateApplicationStatusDto {
  @IsEnum(ApplicationStatus)
  @IsNotEmpty()
  status: ApplicationStatus;
}
