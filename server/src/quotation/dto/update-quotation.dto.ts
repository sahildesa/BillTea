import { PartialType } from '@nestjs/mapped-types';
import { CreateQuotationDto } from './create-quotation.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { QuotationStatus } from '@prisma/client';
import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateQuotationDto extends PartialType(CreateQuotationDto) {
  @IsOptional()
  @IsEnum(QuotationStatus)
    @ApiPropertyOptional({ example: 'sample_value' })
  status?: QuotationStatus;
}
