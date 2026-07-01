import { IsString, IsNumber, IsOptional, IsDateString, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateExpenseDto {
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
    @ApiPropertyOptional({ example: 100 })
  amount?: number;

  @IsString()
  @IsOptional()
    @ApiPropertyOptional({ example: 'sample_value' })
  category?: string;

  @IsString()
  @IsIn(['Cash', 'UPI', 'Bank Transfer', 'Cheque'])
  @IsOptional()
    @ApiPropertyOptional({ example: 'sample_value' })
  paymentMethod?: string;

  @IsString()
  @IsOptional()
    @ApiPropertyOptional({ example: 'sample_value' })
  note?: string;

  @IsDateString()
  @IsOptional()
    @ApiPropertyOptional({ example: 'sample_value' })
  date?: string;

  @IsString()
  @IsOptional()
    @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174000' })
  branchId?: string;
}
