import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Query, UseInterceptors, UploadedFile, BadRequestException, Res, StreamableFile } from '@nestjs/common';
import type { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { QuotationService } from './quotation.service';
import { CreateQuotationDto } from './dto/create-quotation.dto';
import { UpdateQuotationDto } from './dto/update-quotation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('quotations')
export class QuotationController {
  constructor(private readonly quotationService: QuotationService) {}

  @Get('customers/search')
  searchCustomers(
    @CurrentUser() user: any,
    @Query('q') query: string,
    @Query('branchId') branchId?: string,
  ) {
    return this.quotationService.searchCustomers(query, user.companyId, branchId);
  }

  @Get('products/search')
  searchProducts(
    @CurrentUser() user: any,
    @Query('q') query: string,
    @Query('branchId') branchId?: string,
  ) {
    return this.quotationService.searchProducts(query, user.companyId, branchId);
  }

  @Post('preview')
  preview(@CurrentUser() user: any, @Body() createQuotationDto: CreateQuotationDto) {
    return this.quotationService.calculatePreview(user.companyId, user.sub, createQuotationDto);
  }

  @Post()
  create(@CurrentUser() user: any, @Body() createQuotationDto: CreateQuotationDto) {
    return this.quotationService.create(user.companyId, user.sub, createQuotationDto);
  }

  @Get()
  findAll(@CurrentUser() user: any, @Query('branchId') branchId?: string) {
    return this.quotationService.findAll(user.companyId, branchId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.quotationService.findOne(id, user.companyId);
  }

  @Get(':id/pdf')
  async downloadPdf(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Res({ passthrough: true }) res: Response
  ) {
    const buffer = await this.quotationService.generatePdf(id, user.companyId);
    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="quotation-${id}.pdf"`,
      'Content-Length': buffer.length,
    });
    
    return new StreamableFile(buffer);
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
    return this.quotationService.uploadAttachment(id, user.companyId, file);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() updateQuotationDto: UpdateQuotationDto,
  ) {
    return this.quotationService.update(id, user.companyId, user.sub, updateQuotationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.quotationService.remove(id, user.companyId);
  }
}
