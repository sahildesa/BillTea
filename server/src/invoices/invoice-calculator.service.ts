import { Injectable } from '@nestjs/common';
import { DiscountConfiguration, TaxConfiguration, CalculationResult, ItemCalculationResult } from './invoice.types';

@Injectable()
export class InvoiceCalculatorService {
  /**
   * Calculates the totals for a invoice including all items, discounts, and taxes.
   */
  calculateTotals(
    items: any[], 
    discountConfig: DiscountConfiguration, 
    taxConfig: TaxConfiguration,
    branchTaxPercentage: number = 0
  ): CalculationResult {
    let subtotal = 0;
    let totalDiscount = 0;
    let totalTax = 0;
    const calculatedItems: ItemCalculationResult[] = [];

    // Calculate Item Totals first
    for (const item of items) {
      const itemPrice = item.price || 0;
      const quantity = item.quantity || 1;
      const itemSubtotal = itemPrice * quantity;

      let itemDiscountAmount = 0;

      // Apply Per-Product Discount if mode is PER_PRODUCT
      if (discountConfig.mode === 'PER_PRODUCT' && item.discount) {
        if (item.discount.type === 'PERCENTAGE') {
          itemDiscountAmount = itemSubtotal * ((item.discount.value || 0) / 100);
        } else if (item.discount.type === 'AMOUNT') {
          itemDiscountAmount = item.discount.value || 0;
        }
      }

      // Cap discount to subtotal
      itemDiscountAmount = Math.min(itemDiscountAmount, itemSubtotal);

      const afterDiscount = itemSubtotal - itemDiscountAmount;
      let itemTaxAmount = 0;

      // Apply Per-Product Tax if mode is PER_PRODUCT
      if (taxConfig.mode === 'PER_PRODUCT') {
        const itemTaxPct = item.tax || 0;
        itemTaxAmount = afterDiscount * (itemTaxPct / 100);
      }

      const itemTotal = afterDiscount + itemTaxAmount;

      calculatedItems.push({
        id: item.id,
        productId: item.productId,
        subtotal: itemSubtotal,
        discountAmount: itemDiscountAmount,
        taxAmount: itemTaxAmount,
        total: itemTotal
      });

      subtotal += itemSubtotal;
    }

    // Apply Fixed Discount (Global)
    if (discountConfig.mode === 'FIXED') {
      if (discountConfig.type === 'PERCENTAGE') {
        totalDiscount = subtotal * ((discountConfig.value || 0) / 100);
      } else if (discountConfig.type === 'AMOUNT') {
        totalDiscount = discountConfig.value || 0;
      }
      totalDiscount = Math.min(totalDiscount, subtotal);
    } else {
      // If PER_PRODUCT, sum the item discounts
      totalDiscount = calculatedItems.reduce((sum, item) => sum + item.discountAmount, 0);
    }

    const subtotalAfterDiscount = subtotal - totalDiscount;

    // Apply Fixed Tax (Global)
    if (taxConfig.mode === 'FIXED') {
      totalTax = subtotalAfterDiscount * (branchTaxPercentage / 100);
    } else {
      // If PER_PRODUCT, sum the item taxes
      totalTax = calculatedItems.reduce((sum, item) => sum + item.taxAmount, 0);
    }

    const grandTotal = subtotalAfterDiscount + totalTax;

    return {
      subtotal: Number(subtotal.toFixed(2)),
      discountAmount: Number(totalDiscount.toFixed(2)),
      taxAmount: Number(totalTax.toFixed(2)),
      grandTotal: Number(grandTotal.toFixed(2)),
      items: calculatedItems.map(item => ({
        ...item,
        subtotal: Number(item.subtotal.toFixed(2)),
        discountAmount: Number(item.discountAmount.toFixed(2)),
        taxAmount: Number(item.taxAmount.toFixed(2)),
        total: Number(item.total.toFixed(2))
      }))
    };
  }
}
