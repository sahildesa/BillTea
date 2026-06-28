import { Invoice, InvoiceItem, InvoiceAttachment, Customer, User } from '@prisma/client';
import { ProductSnapshot, DiscountConfiguration, TaxConfiguration, TermsAndConditionsSnapshot } from './invoice.types';

export class InvoiceMapper {
  static toDto(invoice: any) {
    if (!invoice) return null;

    return {
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      status: invoice.status,
      invoiceDate: invoice.invoiceDate,
      invoiceDate: invoice.invoiceDate,
      dueDate: invoice.dueDate,
      amountPaid: invoice.amountPaid,
      amountDue: invoice.amountDue,
      linkedQuotationId: invoice.linkedQuotationId,
      
      customer: invoice.customer ? {
        id: invoice.customer.id,
        customerName: invoice.customer.customerName,
        companyName: invoice.customer.companyName,
        email: invoice.customer.email,
        mobileNumber: invoice.customer.mobileNumber,
      } : null,

      billingAddress: invoice.billingAddressSnapshot,
      shippingAddress: invoice.shippingAddressSnapshot,
      shippingSameAsBilling: invoice.shippingSameAsBilling,

      discountConfiguration: invoice.discountConfiguration as DiscountConfiguration,
      taxConfiguration: invoice.taxConfiguration as TaxConfiguration,

      totals: {
        subtotal: invoice.subtotal,
        discountAmount: invoice.discountAmount,
        taxAmount: invoice.taxAmount,
        grandTotal: invoice.grandTotal,
      },

      notes: invoice.notes,
      termsAndConditions: invoice.termsAndConditions as TermsAndConditionsSnapshot,

      items: invoice.items ? invoice.items.map(this.toItemDto) : [],
      attachments: invoice.attachments ? invoice.attachments.map(this.toAttachmentDto) : [],
      payments: invoice.payments ? invoice.payments.map(this.toPaymentDto) : [],

      createdAt: invoice.createdAt,
      updatedAt: invoice.updatedAt,
      createdBy: invoice.createdBy ? {
        id: invoice.createdBy.id,
        fullName: invoice.createdBy.fullName,
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

  static toPaymentDto(payment: any) {
    return {
      id: payment.id,
      amount: payment.amount,
      method: payment.method,
      date: payment.date,
      note: payment.note,
      attachmentUrl: payment.attachmentUrl,
      createdAt: payment.createdAt,
    };
  }
}
