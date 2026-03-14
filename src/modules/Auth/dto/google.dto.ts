import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GoogleSignupDto {
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString({ message: 'First name must be a string' })
  @IsNotEmpty({ message: 'First name is required' })
  firstName: string;

  @IsString({ message: 'Last name must be a string' })
  @IsNotEmpty({ message: 'Last name is required' })
  lastName: string;

  @IsString({ message: 'Mobile number must be a string' })
  @IsOptional()
  mobileNumber?: string;
}

export class GoogleLoginDto {
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;
}
