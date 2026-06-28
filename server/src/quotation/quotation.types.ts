export type DiscountMode = 'FIXED' | 'PER_PRODUCT';
export type DiscountType = 'AMOUNT' | 'PERCENTAGE';
export type TaxMode = 'FIXED' | 'PER_PRODUCT';

export interface DiscountConfiguration {
  mode: DiscountMode;
  type?: DiscountType;
  value?: number;
}

export interface TaxConfiguration {
  mode: TaxMode;
}

export interface ProductSnapshot {
  id: string;
  name: string;
  description: string;
  skuNumber: string;
  hsnNumber: string;
}

export interface TermsAndConditionsSnapshot {
  defaultSnapshot: string;
  editedSnapshot: string;
}

export interface CalculationResult {
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  grandTotal: number;
  items: ItemCalculationResult[];
}

export interface ItemCalculationResult {
  id?: string;
  productId?: string;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
}
