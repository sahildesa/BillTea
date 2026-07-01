import { IsString, IsEmail, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateProfileDto {
  @IsOptional() @IsString() @ApiPropertyOptional({ example: 'John Doe' }) fullName?: string;
  @IsOptional() @IsEmail() @ApiPropertyOptional({ example: 'john@gmail.com' }) email?: string;
  @IsOptional() @IsString() @ApiPropertyOptional({ example: '9876543210' }) phoneNumber?: string;
  @IsOptional() @IsString() @ApiPropertyOptional({ example: 'sample_value' }) profilePicture?: string;
}
