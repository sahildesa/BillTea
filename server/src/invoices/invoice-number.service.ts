import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InvoiceNumberService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generates a new invoice number for a specific branch.
   * Format: INV-{YYYYMM}-{SEQ} (e.g., INV-202606-0001)
   */
  async generateNextSequence(branchId: string, companyId: string): Promise<{ sequenceNumber: number; invoiceNumber: string }> {
    // Get the maximum sequence number for this branch
    const lastInvoice = await this.prisma.invoice.findFirst({
      where: { branchId, companyId },
      orderBy: { sequenceNumber: 'desc' },
      select: { sequenceNumber: true }
    });

    const nextSequence = lastInvoice ? lastInvoice.sequenceNumber + 1 : 1;

    // Get current year/month
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    
    // Pad sequence to 4 digits
    const paddedSequence = String(nextSequence).padStart(4, '0');
    
    const invoiceNumber = `INV-${year}${month}-${paddedSequence}`;

    return {
      sequenceNumber: nextSequence,
      invoiceNumber
    };
  }
}
