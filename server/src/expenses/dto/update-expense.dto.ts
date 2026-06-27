import { IsString, IsNumber, IsOptional, IsDateString, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateExpenseDto {
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  amount?: number;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsIn(['Cash', 'UPI', 'Bank Transfer', 'Cheque'])
  @IsOptional()
  paymentMethod?: string;

  @IsString()
  @IsOptional()
  note?: string;

  @IsDateString()
  @IsOptional()
  date?: string;

  @IsString()
  @IsOptional()
  branchId?: string;
}
