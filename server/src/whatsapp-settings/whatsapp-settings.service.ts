import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateWhatsappSettingsDto } from './dto/update-whatsapp-settings.dto';

@Injectable()
export class WhatsappSettingsService {
  constructor(private prisma: PrismaService) {}

  async getSettings(branchId: string) {
    let settings = await this.prisma.whatsappSettings.findUnique({
      where: { branchId },
    });

    if (!settings) {
      settings = await this.prisma.whatsappSettings.create({
        data: {
          branchId,
          instanceId: '',
          accessToken: '',
          autoSendInvoice: true,
          attachPdf: true,
          selectedTemplate: 'standard',
          invoiceTemplate: 'Hello {customer_name},\n\nThis is a friendly message from {company_name}.\nYour invoice {invoice_number} for the amount of {total_amount} is now ready.\n\nPlease find the details attached. The payment is due by {due_date}.\n\nThank you for your business!\nBest regards,\n{company_name} Team',
          quotationTemplate: 'Hi {customer_name},\n\nThank you for requesting a quote from {company_name}.\nWe have prepared quote {quote_number} for {total_amount} based on your requirements.\n\nPlease review the attached document.\n\nRegards,\n{company_name}',
          isLinked: false,
        },
      });
    }

    return settings;
  }

  async updateSettings(branchId: string, dto: UpdateWhatsappSettingsDto) {
    await this.getSettings(branchId); // ensure created

    return this.prisma.whatsappSettings.update({
      where: { branchId },
      data: dto,
    });
  }
}
