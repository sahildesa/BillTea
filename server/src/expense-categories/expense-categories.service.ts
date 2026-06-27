import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ExpenseCategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(name: string, companyId: string, userId: string) {
    const existing = await this.prisma.expenseCategory.findUnique({
      where: {
        companyId_name: {
          companyId,
          name,
        }
      }
    });

    if (existing) {
      throw new ConflictException('Category with this name already exists');
    }

    return this.prisma.expenseCategory.create({
      data: {
        name,
        companyId,
        createdById: userId,
      },
      include: {
        createdBy: {
          select: { fullName: true }
        }
      }
    });
  }

  async findAll(companyId: string) {
    return this.prisma.expenseCategory.findMany({
      where: { companyId },
      include: {
        createdBy: {
          select: { fullName: true }
        }
      },
      orderBy: { name: 'asc' }
    });
  }

  async update(id: string, name: string, companyId: string) {
    const existing = await this.prisma.expenseCategory.findUnique({
      where: { id }
    });

    if (!existing || existing.companyId !== companyId) {
      throw new NotFoundException('Category not found');
    }

    // Check name conflict
    const nameConflict = await this.prisma.expenseCategory.findUnique({
      where: {
        companyId_name: { companyId, name }
      }
    });

    if (nameConflict && nameConflict.id !== id) {
      throw new ConflictException('Another category with this name already exists');
    }

    return this.prisma.expenseCategory.update({
      where: { id },
      data: { name },
      include: {
        createdBy: { select: { fullName: true } }
      }
    });
  }

  async remove(id: string, companyId: string) {
    const existing = await this.prisma.expenseCategory.findUnique({
      where: { id },
      include: {
        _count: { select: { expenses: true } }
      }
    });

    if (!existing || existing.companyId !== companyId) {
      throw new NotFoundException('Category not found');
    }

    if (existing._count.expenses > 0) {
      throw new ConflictException('Cannot delete category because it is used in expenses');
    }

    await this.prisma.expenseCategory.delete({
      where: { id }
    });

    return { success: true };
  }
}
