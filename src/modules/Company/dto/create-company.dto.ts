import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsArray,
  IsOptional,
  IsMongoId,
} from 'class-validator';

export class CreateCompanyDto {
  @IsString()
  @IsNotEmpty()
  companyName: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  industry: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  numberOfEmployees: string;

  @IsEmail()
  @IsNotEmpty()
  companyEmail: string;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  HRs?: string[];
}
