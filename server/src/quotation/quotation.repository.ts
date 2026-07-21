import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class QuotationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createQuotation(data: any, itemsData: any[]) {
    // We execute this in a transaction
    return this.prisma.$transaction(async (tx) => {
      const quotation = await tx.quotation.create({
        data: {
          ...data,
          items: {
            create: itemsData,
          },
        },
        include: {
          items: true,
          customer: true,
          createdBy: true,
          attachments: true,
        },
      });
      return quotation;
    });
  }

  async findLatestQuotationSequence(companyId: string, branchId: string) {
    return this.prisma.quotation.findFirst({
      where: { companyId, branchId },
      orderBy: { createdAt: 'desc' },
      select: { sequenceNumber: true, id: true }
    });
  }

  async findAll(companyId: string, branchId?: string) {
    return this.prisma.quotation.findMany({
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
    const quotation = await this.prisma.quotation.findFirst({
      where: { id, companyId },
      include: {
        customer: true,
        items: true,
        createdBy: true,
        attachments: true
      }
    });

    if (!quotation) {
      throw new NotFoundException('Quotation not found');
    }

    return quotation;
  }

  async updateQuotation(id: string, companyId: string, data: any, itemsData?: any[]) {
    return this.prisma.$transaction(async (tx) => {
      // If items are provided, delete existing and recreate
      // (Simple approach for snapshot immutability, normally we'd diff, but since it's draft editing, full replace is safer)
      if (itemsData) {
        await tx.quotationItem.deleteMany({
          where: { quotationId: id }
        });
        data.items = {
          create: itemsData
        };
      }

      return tx.quotation.update({
        where: { id },
        data,
        include: {
          items: true,
          customer: true,
          createdBy: true,
          attachments: true
        }
      });
    });
  }

  async deleteQuotation(id: string, companyId: string) {
    return this.prisma.quotation.delete({
      where: { id },
    });
  }

  async createAttachment(data: any) {
    return this.prisma.quotationAttachment.create({
      data
    });
  }
}
