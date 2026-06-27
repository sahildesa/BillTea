import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(companyId: string, userId: string, createProductDto: CreateProductDto, imagePath: string) {
    // Verify branch belongs to company
    const branch = await this.prisma.branch.findFirst({
      where: { id: createProductDto.branchId, companyId }
    });

    if (!branch) {
      throw new BadRequestException('Invalid branch ID.');
    }

    const product = await this.prisma.product.create({
      data: {
        ...createProductDto,
        companyId,
        createdById: userId,
        image: imagePath,
      },
    });

    return { success: true, product };
  }

  async findAll(companyId: string, branchId?: string) {
    const whereClause: any = { companyId, isActive: true };
    if (branchId) {
      whereClause.branchId = branchId;
    }

    const products = await this.prisma.product.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });

    return { success: true, products };
  }

  async findOne(id: string, companyId: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, companyId, isActive: true },
    });

    if (!product) {
      throw new NotFoundException('Product not found.');
    }

    return { success: true, product };
  }

  async update(id: string, companyId: string, updateProductDto: UpdateProductDto, imagePath?: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, companyId },
    });

    if (!product) {
      throw new NotFoundException('Product not found.');
    }

    if (updateProductDto.branchId) {
      const branch = await this.prisma.branch.findFirst({
        where: { id: updateProductDto.branchId, companyId }
      });
      if (!branch) throw new BadRequestException('Invalid branch ID.');
    }

    const dataToUpdate: any = { ...updateProductDto };
    if (imagePath !== undefined) {
      dataToUpdate.image = imagePath;
    }

    const updatedProduct = await this.prisma.product.update({
      where: { id },
      data: dataToUpdate,
    });

    return { success: true, product: updatedProduct };
  }

  async remove(id: string, companyId: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, companyId },
    });

    if (!product) {
      throw new NotFoundException('Product not found.');
    }

    await this.prisma.product.update({
      where: { id },
      data: { isActive: false },
    });

    return { success: true, message: 'Product deleted successfully' };
  }
}
