import { PartialType } from '@nestjs/mapped-types';
import { CreateQuotationDto } from './create-quotation.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { QuotationStatus } from '@prisma/client';

export class UpdateQuotationDto extends PartialType(CreateQuotationDto) {
  @IsOptional()
  @IsEnum(QuotationStatus)
  status?: QuotationStatus;
}
