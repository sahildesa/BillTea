import { IsString, IsNotEmpty, IsNumber, IsOptional, IsDateString, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateExpenseDto {
  @IsString()
  @IsNotEmpty()
  branchId: string;

  @IsNumber()
  @Type(() => Number)
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsString()
  @IsIn(['Cash', 'UPI', 'Bank Transfer', 'Cheque'])
  @IsNotEmpty()
  paymentMethod: string;

  @IsString()
  @IsOptional()
  note?: string;

  @IsDateString()
  @IsNotEmpty()
  date: string;
}
