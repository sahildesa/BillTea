import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InvoiceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createInvoice(data: any, itemsData: any[], paymentData?: any[]) {
    // We execute this in a transaction
    return this.prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.create({
        data: {
          ...data,
          items: {
            create: itemsData,
          },
          ...(paymentData && paymentData.length > 0 ? {
            payments: {
              create: paymentData,
            }
          } : {}),
        },
        include: {
          items: true,
          customer: true,
          createdBy: true,
          attachments: true,
          payments: true,
        },
      });
      return invoice;
    });
  }

  async findLatestInvoiceSequence(companyId: string, branchId: string) {
    return this.prisma.invoice.findFirst({
      where: { companyId, branchId },
      orderBy: { sequenceNumber: 'desc' },
      select: { sequenceNumber: true, id: true }
    });
  }

  async findAll(companyId: string, branchId?: string) {
    return this.prisma.invoice.findMany({
      where: {
        companyId,
        ...(branchId ? { branchId } : {})
      },
      orderBy: { createdAt: 'desc' },
      include: {
        customer: true,
        createdBy: true
      }
    });
  }

  async findById(id: string, companyId: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, companyId },
      include: {
        customer: true,
        items: true,
        createdBy: true,
        attachments: true,
        payments: true,
      }
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    return invoice;
  }

  async updateInvoice(id: string, companyId: string, data: any, itemsData?: any[]) {
    return this.prisma.$transaction(async (tx) => {
      // If items are provided, delete existing and recreate
      // (Simple approach for snapshot immutability, normally we'd diff, but since it's draft editing, full replace is safer)
      if (itemsData) {
        await tx.invoiceItem.deleteMany({
          where: { invoiceId: id }
        });
        data.items = {
          create: itemsData
        };
      }

      return tx.invoice.update({
        where: { id },
        data,
        include: {
          items: true,
          customer: true,
          createdBy: true,
          attachments: true,
          payments: true,
        }
      });
    });
  }

  async deleteInvoice(id: string, companyId: string) {
    return this.prisma.invoice.delete({
      where: { id },
    });
  }

  async createAttachment(data: any) {
    return this.prisma.invoiceAttachment.create({
      data
    });
  }
}
