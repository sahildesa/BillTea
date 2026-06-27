import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ExpensesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createExpenseDto: CreateExpenseDto, companyId: string, userId: string, attachmentPath?: string) {
    // Verify branch belongs to company
    const branch = await this.prisma.branch.findFirst({
      where: { id: createExpenseDto.branchId, companyId }
    });

    if (!branch) {
      throw new ForbiddenException('Branch does not exist or does not belong to your company');
    }

    const { category, ...restDto } = createExpenseDto;

    // Find or create category
    let expenseCategory = await this.prisma.expenseCategory.findUnique({
      where: { companyId_name: { companyId, name: category } }
    });

    if (!expenseCategory) {
      expenseCategory = await this.prisma.expenseCategory.create({
        data: {
          name: category,
          companyId,
          createdById: userId,
        }
      });
    }

    return this.prisma.expense.create({
      data: {
        ...restDto,
        date: new Date(createExpenseDto.date),
        companyId,
        createdById: userId,
        categoryId: expenseCategory.id,
        attachment: attachmentPath || ''
      },
      include: {
        category: true,
        createdBy: { select: { fullName: true } }
      }
    });
  }

  async findAll(companyId: string, branchId?: string) {
    return this.prisma.expense.findMany({
      where: {
        companyId,
        ...(branchId ? { branchId } : {})
      },
      orderBy: {
        date: 'desc'
      },
      include: {
        category: true,
        createdBy: {
          select: { fullName: true }
        }
      }
    });
  }

  async findOne(id: string, companyId: string) {
    const expense = await this.prisma.expense.findFirst({
      where: { id, companyId },
      include: {
        category: true,
        createdBy: {
          select: { fullName: true }
        }
      }
    });

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    return expense;
  }

  async update(id: string, updateExpenseDto: UpdateExpenseDto, companyId: string, attachmentPath?: string) {
    const expense = await this.findOne(id, companyId);

    if (updateExpenseDto.branchId) {
      const branch = await this.prisma.branch.findFirst({
        where: { id: updateExpenseDto.branchId, companyId }
      });
      if (!branch) {
        throw new ForbiddenException('Branch does not exist or does not belong to your company');
      }
    }

    const { category, ...restDto } = updateExpenseDto;
    const dataToUpdate: any = { ...restDto };
    
    if (updateExpenseDto.date) {
      dataToUpdate.date = new Date(updateExpenseDto.date);
    }
    
    // Find or create category if it was updated
    if (category) {
      let expenseCategory = await this.prisma.expenseCategory.findUnique({
        where: { companyId_name: { companyId, name: category } }
      });

      if (!expenseCategory) {
        expenseCategory = await this.prisma.expenseCategory.create({
          data: {
            name: category,
            companyId,
            // We use the expense's creator as a fallback for the new category's creator if updated by someone else, or just leave it null.
            createdById: expense.createdById,
          }
        });
      }
      dataToUpdate.categoryId = expenseCategory.id;
    }

    if (attachmentPath !== undefined) {
      // If a new attachment is provided, and there is an old attachment, we delete the old one
      if (expense.attachment && expense.attachment !== '') {
        const oldFilePath = path.join(process.cwd(), expense.attachment);
        if (fs.existsSync(oldFilePath)) {
          try { fs.unlinkSync(oldFilePath); } catch (e) {}
        }
      }
      dataToUpdate.attachment = attachmentPath;
    }

    return this.prisma.expense.update({
      where: { id },
      data: dataToUpdate,
      include: {
        category: true,
        createdBy: { select: { fullName: true } }
      }
    });
  }

  async remove(id: string, companyId: string) {
    const expense = await this.findOne(id, companyId);

    // Delete attachment if it exists
    if (expense.attachment && expense.attachment !== '') {
      const filePath = path.join(process.cwd(), expense.attachment);
      if (fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch (e) {}
      }
    }

    return this.prisma.expense.delete({
      where: { id }
    });
  }
}
