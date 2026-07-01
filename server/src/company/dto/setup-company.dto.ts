import { IsString, IsOptional, IsArray, MinLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

class MainBranchDto {
  @IsOptional()
  @IsString()
    @ApiPropertyOptional({ example: 'John Doe' })
  name?: string;

  @IsOptional()
  @IsString()
    @ApiPropertyOptional({ example: 'sample_value' })
  address?: string;

  @IsOptional()
  @IsString()
    @ApiPropertyOptional({ example: 'sample_value' })
  city?: string;

  @IsOptional()
  @IsString()
    @ApiPropertyOptional({ example: 'sample_value' })
  state?: string;

  @IsOptional()
  @IsString()
    @ApiPropertyOptional({ example: 'sample_value' })
  pincode?: string;

  @IsOptional()
  @IsString()
    @ApiPropertyOptional({ example: '9876543210' })
  phone?: string;

  @IsOptional()
  @IsString()
    @ApiPropertyOptional({ example: 'john@gmail.com' })
  email?: string;
}

export class SetupCompanyDto {
  @IsString()
  @MinLength(2, { message: 'Company name must be at least 2 characters' })
    @ApiProperty({ example: 'John Doe' })
  name: string;

  @IsOptional()
  @IsString()
    @ApiPropertyOptional({ example: 'sample_value' })
  logo?: string;

  @IsOptional()
  @IsArray()
    @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174000' })
  identifiers?: Array<{ label: string; value: string }>;

  @IsOptional()
  @ValidateNested()
  @Type(() => MainBranchDto)
    @ApiPropertyOptional({ example: 'sample_value' })
  mainBranch?: MainBranchDto;
}
