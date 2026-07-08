import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InvoiceRepository } from './invoice.repository';
import { InvoiceNumberService } from './invoice-number.service';
import { InvoiceCalculatorService } from './invoice-calculator.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { PrismaService } from '../prisma/prisma.service';
import { InvoiceMapper } from './invoice.mapper';
import { generateExpiryDate } from './invoice.utils';
import { INVOICE_CONSTANTS } from './invoice.constants';
import { PdfService } from './pdf.service';

@Injectable()
export class InvoiceService {
  constructor(
    private readonly repository: InvoiceRepository,
    private readonly numberService: InvoiceNumberService,
    private readonly calculatorService: InvoiceCalculatorService,
    private readonly prisma: PrismaService,
    private readonly pdfService: PdfService,
  ) {}

  async create(companyId: string, userId: string, dto: CreateInvoiceDto) {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Invoice must have at least one item');
    }

    // Check branch and get branch tax percentage
    const branch = await this.prisma.branch.findFirst({
      where: { id: dto.branchId, companyId },
    });
    if (!branch) throw new ForbiddenException('Branch not found or access denied');

    // Check customer
    const customer = await this.prisma.customer.findFirst({
      where: { id: dto.customerId, companyId },
    });
    if (!customer) throw new BadRequestException('Invalid customer');

    // Check if invoice for this quotation already exists
    if (dto.linkedQuotationId) {
      const existingInvoice = await this.prisma.invoice.findFirst({
        where: { linkedQuotationId: dto.linkedQuotationId, companyId },
      });
      if (existingInvoice) {
        throw new BadRequestException('An invoice has already been generated for this quotation. Please delete it before generating a new one.');
      }
    }

    // Generate sequence
    const { invoiceNumber, sequenceNumber } = await this.numberService.generateNextSequence(dto.branchId, companyId);

    // Set Due Date
    const invoiceDate = new Date(dto.invoiceDate);
    const dueDate = dto.dueDate ? new Date(dto.dueDate) : generateExpiryDate(invoiceDate, INVOICE_CONSTANTS.DEFAULT_EXPIRY_MONTHS);

    if (dueDate < invoiceDate) {
      throw new BadRequestException('Due date cannot be before invoice date');
    }

    // Build items with original snapshots
    const itemsData = [];
    for (const itemDto of dto.items) {
      if (itemDto.price < 0 || itemDto.quantity < 1) {
        throw new BadRequestException('Price and quantity must be positive');
      }

      let originalProduct = null;
      if (itemDto.productId) {
        originalProduct = await this.prisma.product.findUnique({ where: { id: itemDto.productId } });
      }

      itemsData.push({
        ...itemDto,
        productSnapshot: originalProduct || {},
        originalPrice: originalProduct?.price || itemDto.price,
        originalDescription: originalProduct?.description || itemDto.description || '',
        originalImage: originalProduct?.image || itemDto.image || '',
        editedPrice: itemDto.price,
        editedDescription: itemDto.description || '',
        editedImage: itemDto.image || '',
      });
    }

    // Calculate totals
    const effectiveTax = dto.taxConfiguration.mode === 'FIXED' ? (dto.taxConfiguration.value || 0) : 0;
    const calculation = this.calculatorService.calculateTotals(
      itemsData,
      dto.discountConfiguration,
      dto.taxConfiguration,
      effectiveTax
    );

    // Map calculated items back
    const finalItems = itemsData.map((item, index) => {
      const calcItem = calculation.items[index];
      return {
        productId: item.productId,
        productSnapshot: item.productSnapshot,
        originalPrice: item.originalPrice,
        originalDescription: item.originalDescription,
        originalImage: item.originalImage,
        editedPrice: item.editedPrice,
        editedDescription: item.editedDescription,
        editedImage: item.editedImage,
        quantity: item.quantity,
        discount: item.discount || {},
        tax: item.tax || 0,
        subtotal: calcItem.subtotal,
        discountAmount: calcItem.discountAmount,
        taxAmount: calcItem.taxAmount,
        total: calcItem.total,
      };
    });

    const shippingSnapshot = dto.shippingSameAsBilling ? dto.billingAddress : dto.shippingAddress;
    
    // Process Payment
    let amountPaid = 0;
    let paymentData = [];
    if (dto.paymentConfiguration && dto.paymentConfiguration.addPayment) {
      amountPaid = dto.paymentConfiguration.amount || calculation.grandTotal;
      paymentData.push({
        amount: amountPaid,
        method: dto.paymentConfiguration.method || 'CASH',
        date: dto.paymentConfiguration.date ? new Date(dto.paymentConfiguration.date) : new Date(),
        note: dto.paymentConfiguration.note || '',
      });
    }
    
    const amountDue = Math.max(0, calculation.grandTotal - amountPaid);
    
    let status = 'UNPAID';
    if (amountPaid >= calculation.grandTotal && calculation.grandTotal > 0) {
      status = 'PAID';
    } else if (amountPaid > 0) {
      status = 'PARTIAL';
    }

    // Create invoice
    const invoiceData = {
      invoiceNumber,
      sequenceNumber,
      companyId,
      branchId: dto.branchId,
      customerId: dto.customerId,
      customerSnapshot: {
        customerName: customer.customerName,
        companyName: customer.companyName,
        email: customer.email,
        mobileNumber: customer.mobileNumber,
        businessLabel: customer.businessLabel,
        businessLabelValue: customer.businessLabelValue,
        address: customer.address,
      },
      invoiceDate,
      dueDate,
      billingAddressSnapshot: dto.billingAddress || {},
      shippingAddressSnapshot: shippingSnapshot || {},
      shippingSameAsBilling: dto.shippingSameAsBilling,
      discountConfiguration: dto.discountConfiguration || {},
      taxConfiguration: dto.taxConfiguration || {},
      subtotal: calculation.subtotal,
      discountAmount: calculation.discountAmount,
      taxAmount: calculation.taxAmount,
      grandTotal: calculation.grandTotal,
      amountPaid,
      amountDue,
      status,
      termsAndConditions: dto.termsAndConditions || '',
      notes: dto.notes || '',
      linkedQuotationId: dto.linkedQuotationId,
      createdById: userId,
    };

    const createdInvoice = await this.repository.createInvoice(invoiceData, finalItems, paymentData);
    return InvoiceMapper.toDto(createdInvoice);
  }

  async calculatePreview(companyId: string, userId: string, dto: CreateInvoiceDto) {
    if (!dto.items || dto.items.length === 0) {
      return {
        items: [],
        summary: { subtotal: 0, discountAmount: 0, taxAmount: 0, grandTotal: 0 }
      };
    }

    // Check branch and get branch tax percentage
    const branch = await this.prisma.branch.findFirst({
      where: { id: dto.branchId, companyId },
    });
    if (!branch) throw new ForbiddenException('Branch not found or access denied');

    // We don't validate customer strictly for preview as the user might still be typing
    // Just run the calculation engine


    // Batch fetch original products to prevent N+1 queries
    const productIds = dto.items.map(i => i.productId).filter(Boolean) as string[];
    const originalProducts = await this.prisma.product.findMany({
      where: { id: { in: productIds } }
    });
    const productMap = new Map(originalProducts.map(p => [p.id, p]));

    // Build items with original snapshots
    const itemsData = [];
    for (const itemDto of dto.items) {
      if (itemDto.price < 0 || itemDto.quantity < 1) {
        throw new BadRequestException('Price and quantity must be positive');
      }

      const originalProduct = itemDto.productId ? productMap.get(itemDto.productId) : null;

      itemsData.push({
        ...itemDto,
        productSnapshot: originalProduct || {},
        originalPrice: originalProduct?.price || itemDto.price,
        originalDescription: originalProduct?.description || itemDto.description || '',
        originalImage: originalProduct?.image || itemDto.image || '',
        editedPrice: itemDto.price,
        editedDescription: itemDto.description || '',
        editedImage: itemDto.image || '',
      });
    }

    // Calculate totals
    const effectiveTax = dto.taxConfiguration.mode === 'FIXED' ? (dto.taxConfiguration.value || 0) : 0;
    const calculation = this.calculatorService.calculateTotals(
      itemsData,
      dto.discountConfiguration,
      dto.taxConfiguration,
      effectiveTax
    );

    // Format response to exactly match frontend expectations
    return {
      items: calculation.items.map(item => ({
        id: item.id,
        productId: item.productId,
        subtotal: item.subtotal,
        discountAmount: item.discountAmount,
        taxAmount: item.taxAmount,
        total: item.total
      })),
      summary: {
        subtotal: calculation.subtotal,
        discountAmount: calculation.discountAmount,
        taxAmount: calculation.taxAmount,
        grandTotal: calculation.grandTotal
      }
    };
  }

  async findAll(companyId: string, branchId?: string) {
    const invoices = await this.repository.findAll(companyId, branchId);
    return invoices.map(q => InvoiceMapper.toDto(q));
  }

  async findOne(id: string, companyId: string) {
    const invoice = await this.repository.findById(id, companyId);
    return InvoiceMapper.toDto(invoice);
  }

  async remove(id: string, companyId: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, companyId },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    // Logic: Only allow deleting the MOST RECENT invoice for that branch
    const latestInvoice = await this.repository.findLatestInvoiceSequence(companyId, invoice.branchId);

    if (latestInvoice && latestInvoice.id !== id) {
      throw new BadRequestException('You can only delete the most recently created invoice for this branch.');
    }

    await this.repository.deleteInvoice(id, companyId);
    return { success: true, message: 'Invoice deleted successfully' };
  }

  async searchCustomers(query: string, companyId: string, branchId?: string) {
    const queryFilter = query && query.length > 0 ? {
      OR: [
        { customerName: { contains: query, mode: 'insensitive' as const } },
        { companyName: { contains: query, mode: 'insensitive' as const } },
        { email: { contains: query, mode: 'insensitive' as const } },
        { mobileNumber: { contains: query, mode: 'insensitive' as const } },
      ]
    } : {};

    return this.prisma.customer.findMany({
      where: {
        companyId,
        ...(branchId ? { branchId } : {}),
        ...queryFilter
      },
      orderBy: { customerName: 'asc' },
      take: 10,
    });
  }

  async searchProducts(query: string, companyId: string, branchId?: string) {
    const queryFilter = query && query.length > 0 ? {
      OR: [
        { name: { contains: query, mode: 'insensitive' as const } },
        { skuNumber: { contains: query, mode: 'insensitive' as const } },
        { description: { contains: query, mode: 'insensitive' as const } },
      ]
    } : {};

    return this.prisma.product.findMany({
      where: {
        companyId,
        ...(branchId ? { branchId } : {}),
        isActive: true,
        ...queryFilter
      },
      orderBy: { name: 'asc' },
      take: 10,
    });
  }

  async uploadAttachment(invoiceId: string, companyId: string, file: Express.Multer.File) {
    // Verify invoice exists and belongs to company
    const invoice = await this.prisma.invoice.findFirst({
      where: { id: invoiceId, companyId },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    if (!INVOICE_CONSTANTS.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type');
    }

    if (file.size > INVOICE_CONSTANTS.MAX_FILE_SIZE) {
      throw new BadRequestException('File is too large');
    }

    // Save attachment record in DB
    // Assuming multer saves the file and adds 'filename' to the file object
    const attachmentData = {
      invoiceId: invoice.id,
      fileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
      storagePath: file.filename || file.originalname, // Fallback if using memory storage without disk writing setup
    };

    const attachment = await this.repository.createAttachment(attachmentData);
    return InvoiceMapper.toAttachmentDto(attachment);
  }

  async generatePdf(id: string, companyId: string): Promise<Buffer> {
    const invoice = await this.repository.findById(id, companyId);
    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });
    
    if (!company) {
      throw new NotFoundException('Company not found');
    }

    const branch = await this.prisma.branch.findUnique({
      where: { id: invoice.branchId },
    });

    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    return this.pdfService.generateInvoicePdf(invoice, company, branch, invoice.customer);
  }
}
