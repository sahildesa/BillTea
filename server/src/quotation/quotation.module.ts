import { Module } from '@nestjs/common';
import { QuotationService } from './quotation.service';
import { QuotationController } from './quotation.controller';
import { QuotationRepository } from './quotation.repository';
import { QuotationNumberService } from './quotation-number.service';
import { QuotationCalculatorService } from './quotation-calculator.service';

@Module({
  controllers: [QuotationController],
  providers: [
    QuotationService, 
    QuotationRepository, 
    QuotationNumberService, 
    QuotationCalculatorService
  ],
  exports: [QuotationService]
})
export class QuotationModule {}
