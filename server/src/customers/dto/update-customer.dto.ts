import { IsString, IsOptional, IsEmail, IsBoolean, MinLength } from 'class-validator';
import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateCustomerDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
    @ApiPropertyOptional({ example: 'John Doe' })
  customerName?: string;

  @IsOptional()
  @IsString()
    @ApiPropertyOptional({ example: '9876543210' })
  mobileNumber?: string;

  @IsOptional()
  @IsString()
    @ApiPropertyOptional({ example: 'John Doe' })
  companyName?: string;

  @IsOptional()
  @IsEmail()
    @ApiPropertyOptional({ example: 'john@gmail.com' })
  email?: string;

  @IsOptional()
  @IsString()
    @ApiPropertyOptional({ example: 'sample_value' })
  businessLabel?: string;

  @IsOptional()
  @IsString()
    @ApiPropertyOptional({ example: 'sample_value' })
  businessLabelValue?: string;

  @IsOptional()
  @IsString()
    @ApiPropertyOptional({ example: 'sample_value' })
  address?: string;

  @IsOptional()
  @IsString()
    @ApiPropertyOptional({ example: 'sample_value' })
  otherInfo?: string;

  @IsOptional()
  @IsBoolean()
    @ApiPropertyOptional({ example: true })
  isActive?: boolean;
}
