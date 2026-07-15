import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, UseInterceptors, UploadedFile, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SubscriptionGuard } from '../common/guards/subscription.guard';
import { FeatureGuard } from '../common/guards/feature.guard';
import { RequireSubscription } from '../common/decorators/subscription.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from "@nestjs/swagger";

@UseGuards(JwtAuthGuard, SubscriptionGuard, FeatureGuard)
@Controller('products')
@ApiTags('Products')
@ApiBearerAuth()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @RequireSubscription('product')
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({ summary: 'Create' })
  @ApiResponse({ status: 201, description: 'Created successfully.' })
  create(
    @CurrentUser() user: any,
    @Body() createProductDto: CreateProductDto,
    @UploadedFile() file?: Express.Multer.File
  ) {
    const imagePath = file ? `uploads/products/${file.filename}` : '';
    return this.productsService.create(user.companyId, user.userId, createProductDto, imagePath);
  }

  @Get()
    @ApiOperation({ summary: 'Find All' })
    @ApiResponse({ status: 200, description: 'Successful operation.' })
  findAll(@CurrentUser() user: any, @Query('branchId') branchId?: string) {
    return this.productsService.findAll(user.companyId, branchId);
  }

  @Get(':id')
    @ApiOperation({ summary: 'Find One' })
    @ApiResponse({ status: 200, description: 'Successful operation.' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.productsService.findOne(id, user.companyId);
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('image'))
    @ApiOperation({ summary: 'Update' })
    @ApiResponse({ status: 200, description: 'Successful operation.' })
  update(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFile() file?: Express.Multer.File
  ) {
    const imagePath = file ? `uploads/products/${file.filename}` : undefined;
    return this.productsService.update(id, user.companyId, updateProductDto, imagePath);
  }

  @Delete(':id')
    @ApiOperation({ summary: 'Remove' })
    @ApiResponse({ status: 200, description: 'Successful operation.' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.productsService.remove(id, user.companyId);
  }
}
