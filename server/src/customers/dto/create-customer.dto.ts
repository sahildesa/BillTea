import { IsString, IsOptional, IsEmail, IsBoolean, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateCustomerDto {
  @IsString()
    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  branchId: string;

  @IsString()
  @MinLength(2)
    @ApiProperty({ example: 'John Doe' })
  customerName: string;

  @IsString()
    @ApiProperty({ example: '9876543210' })
  mobileNumber: string;

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
