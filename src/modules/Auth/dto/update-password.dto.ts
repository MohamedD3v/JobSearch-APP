import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdatePasswordDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  oldPassword?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  newPassword: string;
}
