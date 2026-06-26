import { IsString, IsOptional, IsEmail, IsBoolean, MinLength } from 'class-validator';

export class UpdateCustomerDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  customerName?: string;

  @IsOptional()
  @IsString()
  mobileNumber?: string;

  @IsOptional()
  @IsString()
  companyName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  businessLabel?: string;

  @IsOptional()
  @IsString()
  businessLabelValue?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  otherInfo?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
