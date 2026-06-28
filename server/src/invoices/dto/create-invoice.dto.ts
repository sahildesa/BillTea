import { IsString, IsOptional, IsBoolean, IsNumber, IsArray, ValidateNested, IsObject, IsDateString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { InvoiceStatus, PaymentMethod } from '@prisma/client';

export class PaymentConfigurationDto {
  @IsBoolean()
  addPayment: boolean;

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsEnum(PaymentMethod)
  method?: PaymentMethod;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  note?: string;
}
export class DiscountConfigurationDto {
  @IsString()
  mode: 'FIXED' | 'PER_PRODUCT';

  @IsOptional()
  @IsString()
  type?: 'AMOUNT' | 'PERCENTAGE';

  @IsOptional()
  @IsNumber()
  value?: number;
}

export class TaxConfigurationDto {
  @IsString()
  mode: 'FIXED' | 'PER_PRODUCT';

  @IsOptional()
  @IsNumber()
  value?: number;

  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @IsBoolean()
  customTaxActive?: boolean;
}

export class InvoiceItemDto {
  @IsOptional()
  @IsString()
  productId?: string;

  @IsNumber()
  price: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsNumber()
  quantity: number;

  @IsOptional()
  @IsObject()
  discount?: any;

  @IsOptional()
  @IsNumber()
  tax?: number;
}

export class CreateInvoiceDto {
  @IsString()
  branchId: string;

  @IsString()
  customerId: string;

  @IsDateString()
  invoiceDate: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsObject()
  billingAddress: any;

  @IsObject()
  shippingAddress: any;

  @IsBoolean()
  shippingSameAsBilling: boolean;

  @ValidateNested()
  @Type(() => DiscountConfigurationDto)
  discountConfiguration: DiscountConfigurationDto;

  @ValidateNested()
  @Type(() => TaxConfigurationDto)
  taxConfiguration: TaxConfigurationDto;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsObject()
  termsAndConditions?: any;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  items: InvoiceItemDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => PaymentConfigurationDto)
  paymentConfiguration?: PaymentConfigurationDto;

  @IsOptional()
  @IsString()
  linkedQuotationId?: string;
}
