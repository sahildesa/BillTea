import { Controller, Get, Put, Body, Param, UseGuards } from '@nestjs/common';
import { WhatsappSettingsService } from './whatsapp-settings.service';
import { UpdateWhatsappSettingsDto } from './dto/update-whatsapp-settings.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('whatsapp-settings')
@UseGuards(JwtAuthGuard)
export class WhatsappSettingsController {
  constructor(private readonly whatsappSettingsService: WhatsappSettingsService) {}

  @Get(':branchId')
  async getSettings(@Param('branchId') branchId: string) {
    const settings = await this.whatsappSettingsService.getSettings(branchId);
    return { success: true, settings };
  }

  @Put(':branchId')
  async updateSettings(
    @Param('branchId') branchId: string,
    @Body() dto: UpdateWhatsappSettingsDto,
  ) {
    const settings = await this.whatsappSettingsService.updateSettings(branchId, dto);
    return { success: true, settings };
  }
}
