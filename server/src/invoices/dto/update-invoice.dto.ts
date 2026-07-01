import { PartialType } from '@nestjs/mapped-types';
import { CreateInvoiceDto } from './create-invoice.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { InvoiceStatus } from '@prisma/client';
import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateInvoiceDto extends PartialType(CreateInvoiceDto) {
  @IsOptional()
  @IsEnum(InvoiceStatus)
    @ApiPropertyOptional({ example: 'sample_value' })
  status?: InvoiceStatus;
}
