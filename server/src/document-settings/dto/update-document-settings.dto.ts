import { IsBoolean, IsNumber, IsOptional, IsString, IsEnum } from 'class-validator';
import { DocumentType } from '@prisma/client';

export class UpdateDocumentSettingsDto {
  @IsEnum(DocumentType)
  type: DocumentType;

  @IsString()
  @IsOptional()
  prefix?: string;

  @IsNumber()
  @IsOptional()
  nextNumber?: number;

  @IsString()
  @IsOptional()
  topMessage?: string;

  @IsString()
  @IsOptional()
  bottomMessage?: string;

  @IsString()
  @IsOptional()
  terms?: string;

  @IsBoolean()
  @IsOptional()
  showSku?: boolean;

  @IsBoolean()
  @IsOptional()
  showHsn?: boolean;

  @IsString()
  @IsOptional()
  paymentMethod?: string;
}
