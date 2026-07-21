import { Controller, Get, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { DocumentSettingsService } from './document-settings.service';
import { UpdateDocumentSettingsDto } from './dto/update-document-settings.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DocumentType } from '@prisma/client';

@Controller('document-settings')
@UseGuards(JwtAuthGuard)
export class DocumentSettingsController {
  constructor(private readonly documentSettingsService: DocumentSettingsService) {}

  @Get(':branchId')
  async getSettings(
    @Param('branchId') branchId: string,
    @Query('type') type: DocumentType,
  ) {
    if (!type || !Object.values(DocumentType).includes(type)) {
      type = DocumentType.QUOTATION; // Fallback or throw error
    }
    const settings = await this.documentSettingsService.getSettings(branchId, type);
    return { success: true, settings };
  }

  @Put(':branchId')
  async updateSettings(
    @Param('branchId') branchId: string,
    @Body() dto: UpdateDocumentSettingsDto,
  ) {
    const settings = await this.documentSettingsService.updateSettings(branchId, dto);
    return { success: true, settings };
  }
}
