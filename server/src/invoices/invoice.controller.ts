import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Query, UseInterceptors, UploadedFile, BadRequestException, Res, StreamableFile } from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { InvoiceService } from './invoice.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from "@nestjs/swagger";

@UseGuards(JwtAuthGuard)
@Controller('invoices')
@ApiTags('Invoice')
@ApiBearerAuth()
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Get('customers/search')
    @ApiOperation({ summary: 'Search Customers' })
    @ApiResponse({ status: 200, description: 'Successful operation.' })
  searchCustomers(
    @CurrentUser() user: any,
    @Query('q') query: string,
    @Query('branchId') branchId?: string,
  ) {
    return this.invoiceService.searchCustomers(query, user.companyId, branchId);
  }

  @Get('products/search')
    @ApiOperation({ summary: 'Search Products' })
    @ApiResponse({ status: 200, description: 'Successful operation.' })
  searchProducts(
    @CurrentUser() user: any,
    @Query('q') query: string,
    @Query('branchId') branchId?: string,
  ) {
    return this.invoiceService.searchProducts(query, user.companyId, branchId);
  }

  @Post('preview')
    @ApiOperation({ summary: 'Preview' })
    @ApiResponse({ status: 201, description: 'Created successfully.' })
  preview(@CurrentUser() user: any, @Body() createInvoiceDto: CreateInvoiceDto) {
    return this.invoiceService.calculatePreview(user.companyId, user.sub, createInvoiceDto);
  }

  @Post()
    @ApiOperation({ summary: 'Create' })
    @ApiResponse({ status: 201, description: 'Created successfully.' })
  create(@CurrentUser() user: any, @Body() createInvoiceDto: CreateInvoiceDto) {
    return this.invoiceService.create(user.companyId, user.sub, createInvoiceDto);
  }

  @Get()
    @ApiOperation({ summary: 'Find All' })
    @ApiResponse({ status: 200, description: 'Successful operation.' })
  findAll(@CurrentUser() user: any, @Query('branchId') branchId?: string) {
    return this.invoiceService.findAll(user.companyId, branchId);
  }

  @Get(':id')
    @ApiOperation({ summary: 'Find One' })
    @ApiResponse({ status: 200, description: 'Successful operation.' })
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
    @ApiOperation({ summary: 'Upload Attachment' })
    @ApiResponse({ status: 201, description: 'Created successfully.' })
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


  @Put(':id')
    @ApiOperation({ summary: 'Update' })
    @ApiResponse({ status: 200, description: 'Successful operation.' })
  update(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() updateInvoiceDto: UpdateInvoiceDto,
  ) {
    return this.invoiceService.update(id, user.companyId, user.sub, updateInvoiceDto);
  }

  @Delete(':id')
    @ApiOperation({ summary: 'Remove' })
    @ApiResponse({ status: 200, description: 'Successful operation.' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.invoiceService.remove(id, user.companyId);
  }

  @Get(':id/pdf')
    @ApiOperation({ summary: 'Download Pdf' })
    @ApiResponse({ status: 200, description: 'Successful operation.' })
  async downloadPdf(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Res({ passthrough: true }) res: Response
  ) {
    const buffer = await this.invoiceService.generatePdf(id, user.companyId);
    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="invoice-${id}.pdf"`,
      'Content-Length': buffer.length,
    });
    
    return new StreamableFile(buffer);
  }
}
