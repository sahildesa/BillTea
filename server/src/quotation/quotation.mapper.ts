import { Quotation, QuotationItem, QuotationAttachment, Customer, User } from '@prisma/client';
import { ProductSnapshot, DiscountConfiguration, TaxConfiguration, TermsAndConditionsSnapshot } from './quotation.types';

export class QuotationMapper {
  static toDto(quotation: any) {
    if (!quotation) return null;

    return {
      id: quotation.id,
      quotationNumber: quotation.quotationNumber,
      status: quotation.status,
      quotationDate: quotation.quotationDate,
      expiryDate: quotation.expiryDate,
      
      customer: quotation.customer ? {
        id: quotation.customer.id,
        customerName: quotation.customer.customerName,
        companyName: quotation.customer.companyName,
        email: quotation.customer.email,
        mobileNumber: quotation.customer.mobileNumber,
      } : null,

      billingAddress: quotation.billingAddressSnapshot,
      shippingAddress: quotation.shippingAddressSnapshot,
      shippingSameAsBilling: quotation.shippingSameAsBilling,

      discountConfiguration: quotation.discountConfiguration as DiscountConfiguration,
      taxConfiguration: quotation.taxConfiguration as TaxConfiguration,

      totals: {
        subtotal: quotation.subtotal,
        discountAmount: quotation.discountAmount,
        taxAmount: quotation.taxAmount,
        grandTotal: quotation.grandTotal,
      },

      notes: quotation.notes,
      termsAndConditions: quotation.termsAndConditions as TermsAndConditionsSnapshot,

      items: quotation.items ? quotation.items.map(this.toItemDto) : [],
      attachments: quotation.attachments ? quotation.attachments.map(this.toAttachmentDto) : [],

      createdAt: quotation.createdAt,
      updatedAt: quotation.updatedAt,
      createdBy: quotation.createdBy ? {
        id: quotation.createdBy.id,
        fullName: quotation.createdBy.fullName,
      } : null,
    };
  }

  static toItemDto(item: any) {
    return {
      id: item.id,
      productId: item.productId,
      productSnapshot: item.productSnapshot as ProductSnapshot,
      
      price: item.editedPrice,
      description: item.editedDescription,
      image: item.editedImage,
      quantity: item.quantity,
      
      discount: item.discount,
      tax: item.tax,

      totals: {
        subtotal: item.subtotal,
        discountAmount: item.discountAmount,
        taxAmount: item.taxAmount,
        total: item.total,
      },
    };
  }

  static toAttachmentDto(attachment: any) {
    return {
      id: attachment.id,
      fileName: attachment.fileName,
      fileSize: attachment.fileSize,
      mimeType: attachment.mimeType,
      url: `/uploads/${attachment.storagePath}`,
      uploadedAt: attachment.uploadedAt,
    };
  }
}
