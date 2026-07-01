import { IsString, IsNotEmpty, IsNumber, IsOptional, IsDateString, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateExpenseDto {
  @IsString()
  @IsNotEmpty()
    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  branchId: string;

  @IsNumber()
  @Type(() => Number)
  @IsNotEmpty()
    @ApiProperty({ example: 100 })
  amount: number;

  @IsString()
  @IsNotEmpty()
    @ApiProperty({ example: 'sample_value' })
  category: string;

  @IsString()
  @IsIn(['Cash', 'UPI', 'Bank Transfer', 'Cheque'])
  @IsNotEmpty()
    @ApiProperty({ example: 'sample_value' })
  paymentMethod: string;

  @IsString()
  @IsOptional()
    @ApiPropertyOptional({ example: 'sample_value' })
  note?: string;

  @IsDateString()
  @IsNotEmpty()
    @ApiProperty({ example: 'sample_value' })
  date: string;
}
