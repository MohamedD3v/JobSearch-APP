import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';
import { OTPTypes } from '../../../common/enums/enums';

export class ResendOtpDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsEnum(OTPTypes)
  @IsNotEmpty()
  type: OTPTypes;
}
