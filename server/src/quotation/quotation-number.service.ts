import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DocumentType } from '@prisma/client';

@Injectable()
export class QuotationNumberService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generates a new quotation number for a specific branch.
   * Format: {PREFIX}{YYYYMM}-{SEQ} (e.g., QT-202606-0001)
   */
  async generateNextSequence(branchId: string, companyId: string): Promise<{ sequenceNumber: number; quotationNumber: string }> {
    let settings = await this.prisma.documentSettings.findUnique({
      where: { branchId_type: { branchId, type: DocumentType.QUOTATION } }
    });

    if (!settings) {
      // Find max sequence number to initialize correctly for default prefix
      const lastQuotation = await this.prisma.quotation.findFirst({
        where: { 
          branchId,
          quotationNumber: { startsWith: 'QT-' }
        },
        orderBy: { sequenceNumber: 'desc' },
      });
      const startNumber = lastQuotation ? lastQuotation.sequenceNumber + 1 : 1;

      try {
        settings = await this.prisma.documentSettings.create({
          data: {
            branchId,
            type: DocumentType.QUOTATION,
            prefix: 'QT-',
            nextNumber: startNumber,
            topMessage: 'Thank you for considering our company.\nWe are pleased to submit our quotation\nas per your requirements.',
            bottomMessage: 'Thank you for your business.\nWe look forward to being a part of\nyour beautiful journey.',
            terms: '1. VALIDITY: This quotation is valid for 30 days from the date of issue.\n2. PAYMENT TERMS: 50% advance along with Purchase Order, 50% prior to delivery.',
          }
        });
      } catch (e) {
        // If creation fails due to race condition, fetch it again
        settings = await this.prisma.documentSettings.findUnique({
          where: { branchId_type: { branchId, type: DocumentType.QUOTATION } }
        });
      }
    }

    // Atomically increment the nextNumber and retrieve it.
    // However, if the user manually set nextNumber in the settings UI to a value
    // that already exists in the database, it will crash.
    // To prevent this, we first ensure that the settings nextNumber is valid for THIS prefix.
    const prefix = settings ? settings.prefix : 'QT-';
    const lastQuotation = await this.prisma.quotation.findFirst({
      where: { 
        branchId,
        quotationNumber: { startsWith: prefix }
      },
      orderBy: { sequenceNumber: 'desc' },
    });
    const maxSequence = lastQuotation ? lastQuotation.sequenceNumber : 0;

    if (settings && settings.nextNumber <= maxSequence) {
      // The settings nextNumber is behind the actual max sequence (e.g. user reset it to 1 in settings)
      // Forcefully catch it up
      await this.prisma.documentSettings.update({
        where: { branchId_type: { branchId, type: DocumentType.QUOTATION } },
        data: { nextNumber: maxSequence + 1 }
      });
    }

    // Atomically increment the nextNumber to avoid race conditions
    const updatedSettings = await this.prisma.documentSettings.update({
      where: { branchId_type: { branchId, type: DocumentType.QUOTATION } },
      data: { nextNumber: { increment: 1 } }
    });

    // The sequence number for THIS quotation is the one before the increment
    const nextSequence = updatedSettings.nextNumber - 1;

    // Pad sequence to 4 digits
    const paddedSequence = String(nextSequence).padStart(4, '0');
    
    // Combining prefix and sequence.
    // E.g. QT-0001
    const quotationNumber = `${updatedSettings.prefix}${paddedSequence}`;

    return {
      sequenceNumber: nextSequence,
      quotationNumber
    };
  }
}

