import { IsString, IsOptional, IsEnum, MinLength, IsInt, Min, Max } from 'class-validator';

export class CreateBranchDto {
  @IsString()
  @MinLength(2, { message: 'Branch name must be at least 2 characters' })
  name: string;

  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() state?: string;
  @IsOptional() @IsString() pincode?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() email?: string;
  @IsOptional() @IsString() bankName?: string;
  @IsOptional() @IsString() accountNumber?: string;
  @IsOptional() @IsString() ifscCode?: string;
  @IsOptional() @IsString() upiId?: string;
  @IsOptional() @IsEnum(['TEXT', 'IMAGE']) signatureType?: 'TEXT' | 'IMAGE';
  @IsOptional() @IsString() signatureValue?: string;

  @IsOptional()
  @IsInt()
  @Min(0, { message: 'Tax cannot be less than 0' })
  @Max(100, { message: 'Tax cannot be more than 100' })
  tax?: number;
}
