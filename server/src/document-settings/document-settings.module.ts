import { Module } from '@nestjs/common';
import { DocumentSettingsController } from './document-settings.controller';
import { DocumentSettingsService } from './document-settings.service';

@Module({
  controllers: [DocumentSettingsController],
  providers: [DocumentSettingsService]
})
export class DocumentSettingsModule {}
