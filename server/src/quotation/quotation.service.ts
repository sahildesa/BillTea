import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { QuotationRepository } from './quotation.repository';
import { QuotationNumberService } from './quotation-number.service';
import { QuotationCalculatorService } from './quotation-calculator.service';
import { CreateQuotationDto } from './dto/create-quotation.dto';
import { UpdateQuotationDto } from './dto/update-quotation.dto';
import { PrismaService } from '../prisma/prisma.service';
import { QuotationMapper } from './quotation.mapper';
import { generateExpiryDate } from './quotation.utils';
import { QUOTATION_CONSTANTS } from './quotation.constants';

@Injectable()
export class QuotationService {
  constructor(
    private readonly repository: QuotationRepository,
    private readonly numberService: QuotationNumberService,
    private readonly calculatorService: QuotationCalculatorService,
    private readonly prisma: PrismaService,
  ) {}

  async create(companyId: string, userId: string, dto: CreateQuotationDto) {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Quotation must have at least one item');
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

    // Generate sequence
    const { quotationNumber, sequenceNumber } = await this.numberService.generateNextSequence(dto.branchId, companyId);

    // Set Expiry Date
    const quotationDate = new Date(dto.quotationDate);
    const expiryDate = dto.expiryDate ? new Date(dto.expiryDate) : generateExpiryDate(quotationDate, QUOTATION_CONSTANTS.DEFAULT_EXPIRY_MONTHS);

    if (expiryDate < quotationDate) {
      throw new BadRequestException('Expiry date cannot be before quotation date');
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

    // Create quotation
    const quotationData = {
      quotationNumber,
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
      quotationDate,
      expiryDate,
      billingAddressSnapshot: dto.billingAddress || {},
      shippingAddressSnapshot: shippingSnapshot || {},
      shippingSameAsBilling: dto.shippingSameAsBilling,
      discountConfiguration: dto.discountConfiguration || {},
      taxConfiguration: dto.taxConfiguration || {},
      subtotal: calculation.subtotal,
      discountAmount: calculation.discountAmount,
      taxAmount: calculation.taxAmount,
      grandTotal: calculation.grandTotal,
      termsAndConditions: dto.termsAndConditions || '',
      notes: dto.notes || '',
      createdById: userId,
    };

    const createdQuotation = await this.repository.createQuotation(quotationData, finalItems);
    return QuotationMapper.toDto(createdQuotation);
  }

  async calculatePreview(companyId: string, userId: string, dto: CreateQuotationDto) {
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
    const quotations = await this.repository.findAll(companyId, branchId);
    return quotations.map(q => QuotationMapper.toDto(q));
  }

  async findOne(id: string, companyId: string) {
    const quotation = await this.repository.findById(id, companyId);
    return QuotationMapper.toDto(quotation);
  }

  async remove(id: string, companyId: string) {
    const quotation = await this.prisma.quotation.findFirst({
      where: { id, companyId },
    });

    if (!quotation) {
      throw new NotFoundException('Quotation not found');
    }

    // Logic: Only allow deleting the MOST RECENT quotation for that branch
    const latestQuotation = await this.repository.findLatestQuotationSequence(companyId, quotation.branchId);

    if (latestQuotation && latestQuotation.id !== id) {
      throw new BadRequestException('You can only delete the most recently created quotation for this branch.');
    }

    await this.repository.deleteQuotation(id, companyId);
    return { success: true, message: 'Quotation deleted successfully' };
  }

  async searchCustomers(query: string, companyId: string, branchId?: string) {
    if (!query || query.length < 1) return [];

    return this.prisma.customer.findMany({
      where: {
        companyId,
        ...(branchId ? { branchId } : {}),
        OR: [
          { customerName: { contains: query, mode: 'insensitive' } },
          { companyName: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
          { mobileNumber: { contains: query, mode: 'insensitive' } },
        ]
      },
      take: 10,
    });
  }

  async searchProducts(query: string, companyId: string, branchId?: string) {
    if (!query || query.length < 1) return [];

    return this.prisma.product.findMany({
      where: {
        companyId,
        ...(branchId ? { branchId } : {}),
        isActive: true,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { skuNumber: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ]
      },
      take: 10,
    });
  }

  async uploadAttachment(quotationId: string, companyId: string, file: Express.Multer.File) {
    // Verify quotation exists and belongs to company
    const quotation = await this.prisma.quotation.findFirst({
      where: { id: quotationId, companyId },
    });

    if (!quotation) {
      throw new NotFoundException('Quotation not found');
    }

    if (!QUOTATION_CONSTANTS.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type');
    }

    if (file.size > QUOTATION_CONSTANTS.MAX_FILE_SIZE) {
      throw new BadRequestException('File is too large');
    }

    // Save attachment record in DB
    // Assuming multer saves the file and adds 'filename' to the file object
    const attachmentData = {
      quotationId: quotation.id,
      fileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
      storagePath: file.filename || file.originalname, // Fallback if using memory storage without disk writing setup
    };

    const attachment = await this.repository.createAttachment(attachmentData);
    return QuotationMapper.toAttachmentDto(attachment);
  }
}
