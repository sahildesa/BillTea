import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateWhatsappSettingsDto {
  @IsString()
  @IsOptional()
  instanceId?: string;

  @IsString()
  @IsOptional()
  accessToken?: string;

  @IsBoolean()
  @IsOptional()
  autoSendInvoice?: boolean;

  @IsBoolean()
  @IsOptional()
  attachPdf?: boolean;

  @IsString()
  @IsOptional()
  selectedTemplate?: string;

  @IsString()
  @IsOptional()
  invoiceTemplate?: string;

  @IsString()
  @IsOptional()
  quotationTemplate?: string;

  @IsBoolean()
  @IsOptional()
  isLinked?: boolean;
}
