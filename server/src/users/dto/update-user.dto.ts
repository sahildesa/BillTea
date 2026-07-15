import { IsString, IsEmail, IsEnum, IsOptional, IsBoolean, IsArray, MinLength, Matches } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateUserDto {
  @IsOptional() @IsString() @MinLength(3) @ApiPropertyOptional({ example: 'John Doe' }) fullName?: string;
  @IsOptional() @Matches(/^\d{10}$/, { message: 'Phone number must be exactly 10 digits' }) @ApiPropertyOptional({ example: '9876543210' }) phoneNumber?: string;
  @IsOptional() @IsEmail() @ApiPropertyOptional({ example: 'john@gmail.com' }) email?: string;
  @IsOptional() @IsString() @MinLength(6) @ApiPropertyOptional({ example: 'newpassword123' }) password?: string;
  @IsOptional() @IsEnum(['MANAGER']) @ApiPropertyOptional({ example: 'MANAGER' }) role?: 'MANAGER';
  @IsOptional() @IsString() @ApiPropertyOptional() profilePicture?: string;

  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : value ? [value] : []))
  @IsArray() 
  @IsString({ each: true }) 
  @ApiPropertyOptional({ example: [] }) 
  branches?: string[];
  @IsOptional() @Transform(({ value }) => value === 'true' || value === true) @IsBoolean() @ApiPropertyOptional({ example: true }) isActive?: boolean;
  @IsOptional() @ApiPropertyOptional() removeProfilePicture?: any;
}
