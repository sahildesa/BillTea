import { IsString, IsNumber, IsEnum, IsDateString, IsOptional } from 'class-validator';
import { PaymentMethod } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class AddPaymentDto {
  @IsNumber()
  @ApiProperty({ example: 100 })
  amount: number;

  @IsEnum(PaymentMethod)
  @ApiProperty({ example: 'CASH' })
  method: PaymentMethod;

  @IsDateString()
  @ApiProperty({ example: '2023-10-10T10:10:10Z' })
  date: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'Note' })
  note?: string;
}
