import { IsString, IsOptional, IsBoolean, IsNumber, IsArray, ValidateNested, IsObject, IsDateString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { QuotationStatus } from '@prisma/client';

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

export class QuotationItemDto {
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

export class CreateQuotationDto {
  @IsString()
  branchId: string;

  @IsString()
  customerId: string;

  @IsDateString()
  quotationDate: string;

  @IsOptional()
  @IsDateString()
  expiryDate?: string;

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
  @IsDateString()
  followUpDate?: string;

  @IsOptional()
  @IsObject()
  termsAndConditions?: any;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuotationItemDto)
  items: QuotationItemDto[];
}
