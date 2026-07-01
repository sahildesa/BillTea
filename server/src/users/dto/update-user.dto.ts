import { IsString, IsEmail, IsEnum, IsOptional, IsBoolean, IsArray, MinLength } from 'class-validator';
import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateUserDto {
  @IsOptional() @IsString() @MinLength(3) @ApiPropertyOptional({ example: 'John Doe' }) fullName?: string;
  @IsOptional() @IsString() @ApiPropertyOptional({ example: '9876543210' }) phoneNumber?: string;
  @IsOptional() @IsEmail() @ApiPropertyOptional({ example: 'john@gmail.com' }) email?: string;
  @IsOptional() @IsEnum(['MANAGER', 'STAFF']) @ApiPropertyOptional({ example: 'sample_value' }) role?: 'MANAGER' | 'STAFF';
  @IsOptional() @IsArray() @IsString({ each: true }) @ApiPropertyOptional({ example: [] }) branches?: string[];
  @IsOptional() @IsBoolean() @ApiPropertyOptional({ example: true }) isActive?: boolean;
}
