import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { PurchasePlanDto } from './dto/purchase-plan.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Subscriptions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('current')
  @ApiOperation({ summary: 'Get current subscription and usage' })
  @ApiResponse({ status: 200, description: 'Current subscription retrieved.' })
  getCurrentSubscription(@CurrentUser() user: any) {
    if (!user.companyId) {
      return { success: true, subscription: null, usage: null };
    }
    return this.subscriptionsService.getCurrentSubscription(user.companyId);
  }

  @Post('purchase')
  @ApiOperation({ summary: 'Create Razorpay order to purchase a plan' })
  @ApiResponse({ status: 201, description: 'Order created successfully.' })
  purchasePlan(@CurrentUser() user: any, @Body() dto: PurchasePlanDto) {
    return this.subscriptionsService.purchasePlan(user.companyId, dto);
  }

  @Post('verify-payment')
  @ApiOperation({ summary: 'Verify Razorpay payment and activate subscription' })
  @ApiResponse({ status: 200, description: 'Payment verified and subscription activated.' })
  verifyPayment(@CurrentUser() user: any, @Body() dto: VerifyPaymentDto) {
    return this.subscriptionsService.verifyPayment(user.companyId, dto);
  }

  @Post('renew')
  @ApiOperation({ summary: 'Renew current subscription' })
  @ApiResponse({ status: 200, description: 'Subscription renewed.' })
  renewSubscription(@CurrentUser() user: any) {
    return this.subscriptionsService.renewSubscription(user.companyId);
  }

  @Post('upgrade')
  @ApiOperation({ summary: 'Upgrade to a different plan' })
  @ApiResponse({ status: 200, description: 'Upgrade initiated.' })
  upgradeSubscription(@CurrentUser() user: any, @Body() dto: PurchasePlanDto) {
    return this.subscriptionsService.upgradeSubscription(user.companyId, dto);
  }

  @Post('cancel')
  @ApiOperation({ summary: 'Cancel subscription' })
  @ApiResponse({ status: 200, description: 'Subscription cancelled.' })
  cancelSubscription(@CurrentUser() user: any) {
    return this.subscriptionsService.cancelSubscription(user.companyId);
  }

  @Get('payments')
  @ApiOperation({ summary: 'Get payment history' })
  @ApiResponse({ status: 200, description: 'Payment history retrieved.' })
  getPaymentHistory(@CurrentUser() user: any) {
    return this.subscriptionsService.getPaymentHistory(user.companyId);
  }
}
