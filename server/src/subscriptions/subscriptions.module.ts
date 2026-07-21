import { Module, Global } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';
import { RazorpayService } from './razorpay.service';
import { UsageService } from './usage.service';

@Global()
@Module({
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService, RazorpayService, UsageService],
  exports: [SubscriptionsService, UsageService, RazorpayService],
})
export class SubscriptionsModule {}
