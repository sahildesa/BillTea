import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Query, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { InvoiceService } from './invoice.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('invoices')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Get('customers/search')
  searchCustomers(
    @CurrentUser() user: any,
    @Query('q') query: string,
    @Query('branchId') branchId?: string,
  ) {
    return this.invoiceService.searchCustomers(query, user.companyId, branchId);
  }

  @Get('products/search')
  searchProducts(
    @CurrentUser() user: any,
    @Query('q') query: string,
    @Query('branchId') branchId?: string,
  ) {
    return this.invoiceService.searchProducts(query, user.companyId, branchId);
  }

  @Post('preview')
  preview(@CurrentUser() user: any, @Body() createInvoiceDto: CreateInvoiceDto) {
    return this.invoiceService.calculatePreview(user.companyId, user.sub, createInvoiceDto);
  }

  @Post()
  create(@CurrentUser() user: any, @Body() createInvoiceDto: CreateInvoiceDto) {
    return this.invoiceService.create(user.companyId, user.sub, createInvoiceDto);
  }

  @Get()
  findAll(@CurrentUser() user: any, @Query('branchId') branchId?: string) {
    return this.invoiceService.findAll(user.companyId, branchId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.invoiceService.findOne(id, user.companyId);
  }

  @Post(':id/attachments')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  uploadAttachment(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    return this.invoiceService.uploadAttachment(id, user.companyId, file);
  }


  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.invoiceService.remove(id, user.companyId);
  }
}
