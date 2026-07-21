import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateDocumentSettingsDto } from './dto/update-document-settings.dto';
import { DocumentType } from '@prisma/client';

@Injectable()
export class DocumentSettingsService {
  constructor(private prisma: PrismaService) {}

  async getSettings(branchId: string, type: DocumentType) {
    let settings = await this.prisma.documentSettings.findUnique({
      where: {
        branchId_type: {
          branchId,
          type,
        },
      },
    });

    if (!settings) {
      // Create defaults
      settings = await this.prisma.documentSettings.create({
        data: {
          branchId,
          type,
          prefix: type === DocumentType.QUOTATION ? 'QT-' : 'INV-',
          nextNumber: 1,
          topMessage:
            type === DocumentType.QUOTATION
              ? 'Thank you for considering our company.\nWe are pleased to submit our quotation\nas per your requirements.'
              : 'Thank you for your business.\nThis is your invoice.',
          bottomMessage:
            'Thank you for your business.\nWe look forward to being a part of\nyour beautiful journey.',
          terms:
            type === DocumentType.QUOTATION
              ? '1. VALIDITY: This quotation is valid for 30 days from the date of issue.\n2. PAYMENT TERMS: 50% advance along with Purchase Order, 50% prior to delivery.'
              : '1. Payment is due within 15 days.\n2. Late payments may incur additional fees.',
          showSku: false,
          showHsn: true,
        },
      });
    }

    return settings;
  }

  async updateSettings(branchId: string, dto: UpdateDocumentSettingsDto) {
    // Ensure it exists first to create it if it doesn't
    await this.getSettings(branchId, dto.type);

    return this.prisma.documentSettings.update({
      where: {
        branchId_type: {
          branchId,
          type: dto.type,
        },
      },
      data: {
        prefix: dto.prefix,
        nextNumber: dto.nextNumber,
        topMessage: dto.topMessage,
        bottomMessage: dto.bottomMessage,
        terms: dto.terms,
        showSku: dto.showSku,
        showHsn: dto.showHsn,
        paymentMethod: dto.paymentMethod,
      },
    });
  }
}
