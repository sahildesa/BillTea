import { IsString, IsOptional, IsBoolean, IsNumber, IsArray, ValidateNested, IsObject, IsDateString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { InvoiceStatus, PaymentMethod } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class PaymentConfigurationDto {
  @IsBoolean()
    @ApiProperty({ example: true })
  addPayment: boolean;

  @IsOptional()
  @IsNumber()
    @ApiPropertyOptional({ example: 100 })
  amount?: number;

  @IsOptional()
  @IsEnum(PaymentMethod)
    @ApiPropertyOptional({ example: 'sample_value' })
  method?: PaymentMethod;

  @IsOptional()
  @IsDateString()
    @ApiPropertyOptional({ example: 'sample_value' })
  date?: string;

  @IsOptional()
  @IsString()
    @ApiPropertyOptional({ example: 'sample_value' })
  note?: string;
}
export class DiscountConfigurationDto {
  @IsString()
    @ApiProperty({ example: 'sample_value' })
  mode: 'FIXED' | 'PER_PRODUCT';

  @IsOptional()
  @IsString()
    @ApiPropertyOptional({ example: 'sample_value' })
  type?: 'AMOUNT' | 'PERCENTAGE';

  @IsOptional()
  @IsNumber()
    @ApiPropertyOptional({ example: 100 })
  value?: number;
}

export class TaxConfigurationDto {
  @IsString()
    @ApiProperty({ example: 'sample_value' })
  mode: 'FIXED' | 'PER_PRODUCT';

  @IsOptional()
  @IsNumber()
    @ApiPropertyOptional({ example: 100 })
  value?: number;

  @IsOptional()
  @IsString()
    @ApiPropertyOptional({ example: 'sample_value' })
  label?: string;

  @IsOptional()
  @IsBoolean()
    @ApiPropertyOptional({ example: true })
  customTaxActive?: boolean;
}

export class InvoiceItemDto {
  @IsOptional()
  @IsString()
    @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174000' })
  productId?: string;

  @IsNumber()
    @ApiProperty({ example: 100 })
  price: number;

  @IsOptional()
  @IsString()
    @ApiPropertyOptional({ example: 'sample_value' })
  description?: string;

  @IsOptional()
  @IsString()
    @ApiPropertyOptional({ example: 'https://example.com/image.jpg' })
  image?: string;

  @IsNumber()
    @ApiProperty({ example: 100 })
  quantity: number;

  @IsOptional()
  @IsObject()
    @ApiPropertyOptional({ example: 'sample_value' })
  discount?: any;

  @IsOptional()
  @IsNumber()
    @ApiPropertyOptional({ example: 100 })
  tax?: number;
}

export class CreateInvoiceDto {
  @IsString()
    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  branchId: string;

  @IsString()
    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  customerId: string;

  @IsDateString()
    @ApiProperty({ example: 'sample_value' })
  invoiceDate: string;

  @IsOptional()
  @IsDateString()
    @ApiPropertyOptional({ example: 'sample_value' })
  dueDate?: string;

  @IsObject()
    @ApiProperty({ example: 'sample_value' })
  billingAddress: any;

  @IsObject()
    @ApiProperty({ example: 'sample_value' })
  shippingAddress: any;

  @IsBoolean()
    @ApiProperty({ example: true })
  shippingSameAsBilling: boolean;

  @ValidateNested()
  @Type(() => DiscountConfigurationDto)
    @ApiProperty({ example: 'sample_value' })
  discountConfiguration: DiscountConfigurationDto;

  @ValidateNested()
  @Type(() => TaxConfigurationDto)
    @ApiProperty({ example: 'sample_value' })
  taxConfiguration: TaxConfigurationDto;

  @IsOptional()
  @IsString()
    @ApiPropertyOptional({ example: 'sample_value' })
  notes?: string;

  @IsOptional()
  @IsObject()
    @ApiPropertyOptional({ example: 'sample_value' })
  termsAndConditions?: any;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
    @ApiProperty({ example: [] })
  items: InvoiceItemDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => PaymentConfigurationDto)
    @ApiPropertyOptional({ example: 'sample_value' })
  paymentConfiguration?: PaymentConfigurationDto;

  @IsOptional()
  @IsString()
    @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174000' })
  linkedQuotationId?: string;
}
