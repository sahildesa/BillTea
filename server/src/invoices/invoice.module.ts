import { Module } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { InvoiceController } from './invoice.controller';
import { InvoiceRepository } from './invoice.repository';
import { InvoiceNumberService } from './invoice-number.service';
import { InvoiceCalculatorService } from './invoice-calculator.service';
import { PdfService } from './pdf.service';

@Module({
  controllers: [InvoiceController],
  providers: [
    InvoiceService, 
    InvoiceRepository, 
    InvoiceNumberService, 
    InvoiceCalculatorService,
    PdfService
  ],
  exports: [InvoiceService]
})
export class InvoiceModule {}
