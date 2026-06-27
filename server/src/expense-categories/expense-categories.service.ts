import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ExpenseCategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(name: string, companyId: string, branchId: string, userId: string) {
    const existing = await this.prisma.expenseCategory.findUnique({
      where: {
        branchId_name: {
          branchId,
          name,
        }
      }
    });

    if (existing) {
      throw new ConflictException('Category with this name already exists in this branch');
    }

    return this.prisma.expenseCategory.create({
      data: {
        name,
        companyId,
        branchId,
        createdById: userId,
      },
      include: {
        createdBy: {
          select: { fullName: true }
        }
      }
    });
  }

  async findAll(companyId: string, branchId: string) {
    return this.prisma.expenseCategory.findMany({
      where: { companyId, branchId },
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

    // Check name conflict in the same branch
    const nameConflict = await this.prisma.expenseCategory.findUnique({
      where: {
        branchId_name: { branchId: existing.branchId, name }
      }
    });

    if (nameConflict && nameConflict.id !== id) {
      throw new ConflictException('Another category with this name already exists in this branch');
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
