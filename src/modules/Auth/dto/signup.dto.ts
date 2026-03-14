import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Genders, Roles } from '../../../common/enums/enums';

export class SignupDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsOptional()
  mobileNumber?: string;

  @IsEnum(Genders)
  @IsOptional()
  gender?: Genders;

  @Type(() => Date)
  @IsOptional()
  DOB?: Date;

  @IsEnum(Roles)
  @IsOptional()
  role?: Roles;
}
