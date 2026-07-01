import { IsString, IsEmail, IsEnum, IsOptional, IsArray, MinLength, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateUserDto {
  @IsString()
  @MinLength(3, { message: 'Full name must be at least 3 characters' })
    @ApiProperty({ example: 'John Doe' })
  fullName: string;

  @IsString()
  @Matches(/^\d{10}$/, { message: 'Phone number must be exactly 10 digits' })
    @ApiProperty({ example: '9876543210' })
  phoneNumber: string;

  @IsEmail({}, { message: 'Please enter a valid email address' })
    @ApiProperty({ example: 'john@gmail.com' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
    @ApiProperty({ example: 'password123' })
  password: string;

  @IsEnum(['MANAGER', 'STAFF'], { message: 'Role must be either "MANAGER" or "STAFF"' })
    @ApiProperty({ example: 'sample_value' })
  role: 'MANAGER' | 'STAFF';

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
    @ApiPropertyOptional({ example: [] })
  branches?: string[];
}
