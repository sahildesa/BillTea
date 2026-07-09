import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new customer for a branch.
   */
  async create(companyId: string | null, createdById: string, dto: CreateCustomerDto) {
    if (!companyId) {
      throw new BadRequestException('No company associated with this user.');
    }

    // Verify the branch belongs to the company
    const branch = await this.prisma.branch.findFirst({
      where: { id: dto.branchId, companyId, isActive: true },
    });

    if (!branch) {
      throw new NotFoundException('Branch not found or does not belong to your company.');
    }

    try {
      const customer = await this.prisma.customer.create({
        data: {
          companyId,
          branchId: dto.branchId,
          customerName: dto.customerName,
          companyName: dto.companyName || '',
          email: dto.email || '',
          mobileNumber: dto.mobileNumber,
          businessLabel: dto.businessLabel || '',
          businessLabelValue: dto.businessLabelValue || '',
          address: dto.address || '',
          otherInfo: dto.otherInfo || '',
          isActive: dto.isActive !== undefined ? dto.isActive : true,
          createdById,
        },
      });

      return {
        success: true,
        message: 'Customer created successfully.',
        customer,
      };
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * List all customers for a specific branch (or company if branchId not provided).
   */
  async findAll(companyId: string | null, branchId?: string) {
    if (!companyId) {
      throw new BadRequestException('No company associated with this user.');
    }

    const whereClause: any = { companyId, isActive: true };
    if (branchId) {
      whereClause.branchId = branchId;
    }

    const customers = await this.prisma.customer.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            invoices: true,
            quotations: true,
          },
        },
      },
    });

    return {
      success: true,
      customers,
    };
  }

  /**
   * Get a single customer by ID.
   */
  async findOne(id: string, companyId: string | null) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
    });

    if (!customer || customer.companyId !== companyId) {
      throw new NotFoundException('Customer not found.');
    }

    return {
      success: true,
      customer,
    };
  }

  /**
   * Update a customer.
   */
  async update(id: string, companyId: string | null, dto: UpdateCustomerDto) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
    });

    if (!customer || customer.companyId !== companyId) {
      throw new NotFoundException('Customer not found.');
    }

    const updateData: any = {};
    if (dto.customerName !== undefined) updateData.customerName = dto.customerName;
    if (dto.companyName !== undefined) updateData.companyName = dto.companyName;
    if (dto.mobileNumber !== undefined) updateData.mobileNumber = dto.mobileNumber;
    if (dto.email !== undefined) updateData.email = dto.email;
    if (dto.businessLabel !== undefined) updateData.businessLabel = dto.businessLabel;
    if (dto.businessLabelValue !== undefined) updateData.businessLabelValue = dto.businessLabelValue;
    if (dto.address !== undefined) updateData.address = dto.address;
    if (dto.otherInfo !== undefined) updateData.otherInfo = dto.otherInfo;
    if (dto.isActive !== undefined) updateData.isActive = dto.isActive;

    const updatedCustomer = await this.prisma.customer.update({
      where: { id },
      data: updateData,
    });

    return {
      success: true,
      message: 'Customer updated successfully.',
      customer: updatedCustomer,
    };
  }

  /**
   * Soft delete a customer.
   */
  async remove(id: string, companyId: string | null) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
    });

    if (!customer || customer.companyId !== companyId) {
      throw new NotFoundException('Customer not found.');
    }

    await this.prisma.customer.update({
      where: { id },
      data: { isActive: false },
    });

    return {
      success: true,
      message: 'Customer deactivated successfully.',
    };
  }
}
