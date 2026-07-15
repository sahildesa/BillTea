import { IsString, IsEmail, IsEnum, IsOptional, IsArray, MinLength, Matches, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
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

  @IsEnum(['MANAGER'], { message: 'Role must be "MANAGER"' })
    @ApiProperty({ example: 'MANAGER' })
  role: 'MANAGER';

  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : value ? [value] : []))
  @IsArray()
  @IsString({ each: true })
    @ApiPropertyOptional({ example: [] })
  branches?: string[];

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  profilePicture?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  @ApiPropertyOptional()
  isActive?: boolean;
}
