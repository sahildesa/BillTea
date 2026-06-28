import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class QuotationNumberService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generates a new quotation number for a specific branch.
   * Format: QT-{YYYYMM}-{SEQ} (e.g., QT-202606-0001)
   */
  async generateNextSequence(branchId: string, companyId: string): Promise<{ sequenceNumber: number; quotationNumber: string }> {
    // Get the maximum sequence number for this branch
    const lastQuotation = await this.prisma.quotation.findFirst({
      where: { branchId, companyId },
      orderBy: { sequenceNumber: 'desc' },
      select: { sequenceNumber: true }
    });

    const nextSequence = lastQuotation ? lastQuotation.sequenceNumber + 1 : 1;

    // Get current year/month
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    
    // Pad sequence to 4 digits
    const paddedSequence = String(nextSequence).padStart(4, '0');
    
    const quotationNumber = `QT-${year}${month}-${paddedSequence}`;

    return {
      sequenceNumber: nextSequence,
      quotationNumber
    };
  }
}
