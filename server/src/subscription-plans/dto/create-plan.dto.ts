import { IsString, IsNotEmpty, IsEnum, IsNumber, IsInt, IsBoolean, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PlanRank, BillingCycle } from '@prisma/client';

export class CreatePlanDto {
  @ApiProperty({ description: 'Plan name', example: 'Silver Plan' })
  @IsString()
  @IsNotEmpty({ message: 'Plan name is required.' })
  name: string;

  @ApiProperty({ enum: PlanRank, description: 'Plan rank/tier' })
  @IsEnum(PlanRank)
  rank: PlanRank;

  @ApiPropertyOptional({ description: 'Plan description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Display order (must be unique)', example: 1 })
  @IsInt()
  displayOrder: number;

  @ApiPropertyOptional({ description: 'Whether the plan is active', default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Whether this plan is the recommended one', default: false })
  @IsBoolean()
  @IsOptional()
  isRecommended?: boolean;

  // Pricing
  @ApiProperty({ description: 'Plan price (cannot be negative)', example: 999 })
  @IsNumber()
  @Min(0, { message: 'Price cannot be negative.' })
  price: number;

  @ApiProperty({ enum: BillingCycle, description: 'Billing cycle' })
  @IsEnum(BillingCycle)
  billingCycle: BillingCycle;

  // Usage Limits (0 = Unlimited, negative not allowed)
  @ApiPropertyOptional({ description: 'Max quotations (0 = unlimited)', default: 0 })
  @IsInt()
  @Min(0, { message: 'Quotation limit cannot be negative.' })
  @IsOptional()
  quotationLimit?: number;

  @ApiPropertyOptional({ description: 'Max invoices (0 = unlimited)', default: 0 })
  @IsInt()
  @Min(0, { message: 'Invoice limit cannot be negative.' })
  @IsOptional()
  invoiceLimit?: number;

  @ApiPropertyOptional({ description: 'Max customers (0 = unlimited)', default: 0 })
  @IsInt()
  @Min(0, { message: 'Customer limit cannot be negative.' })
  @IsOptional()
  customerLimit?: number;

  @ApiPropertyOptional({ description: 'Max products (0 = unlimited)', default: 0 })
  @IsInt()
  @Min(0, { message: 'Product limit cannot be negative.' })
  @IsOptional()
  productLimit?: number;

  @ApiPropertyOptional({ description: 'Max branches (0 = unlimited)', default: 0 })
  @IsInt()
  @Min(0, { message: 'Branch limit cannot be negative.' })
  @IsOptional()
  branchLimit?: number;

  @ApiPropertyOptional({ description: 'Max staff (0 = unlimited)', default: 0 })
  @IsInt()
  @Min(0, { message: 'Staff limit cannot be negative.' })
  @IsOptional()
  staffLimit?: number;

  @ApiPropertyOptional({ description: 'Max WhatsApp messages (0 = unlimited)', default: 0 })
  @IsInt()
  @Min(0, { message: 'WhatsApp message limit cannot be negative.' })
  @IsOptional()
  whatsappMessageLimit?: number;

  // Feature Permissions
  @ApiPropertyOptional({ description: 'Custom quotation themes allowed', default: false })
  @IsBoolean()
  @IsOptional()
  customQuotationThemes?: boolean;

  @ApiPropertyOptional({ description: 'Custom invoice themes allowed', default: false })
  @IsBoolean()
  @IsOptional()
  customInvoiceThemes?: boolean;

  @ApiPropertyOptional({ description: 'WhatsApp integration allowed', default: false })
  @IsBoolean()
  @IsOptional()
  whatsappIntegration?: boolean;
}
