import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RazorpayService } from './razorpay.service';
import { UsageService } from './usage.service';
import { PurchasePlanDto } from './dto/purchase-plan.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';

@Injectable()
export class SubscriptionsService {
  constructor(
    private prisma: PrismaService,
    private razorpay: RazorpayService,
    private usage: UsageService,
  ) {}

  /**
   * Get the current subscription for a company with usage details.
   */
  async getCurrentSubscription(companyId: string) {
    const subscription = await this.prisma.companySubscription.findUnique({
      where: { companyId },
      include: { plan: true },
    });

    if (!subscription) {
      return { success: true, subscription: null, usage: null };
    }

    // Check if expired by date
    if (
      (subscription.status === 'ACTIVE' || subscription.status === 'TRIAL') &&
      new Date() > subscription.expiryDate
    ) {
      await this.prisma.companySubscription.update({
        where: { id: subscription.id },
        data: { status: 'EXPIRED' },
      });
      subscription.status = 'EXPIRED';
    }

    const usageData = await this.usage.getUsageWithLimits(companyId);

    return { success: true, subscription, usage: usageData };
  }

  /**
   * Step 1: Create a Razorpay order for purchasing a plan.
   */
  async purchasePlan(companyId: string, dto: PurchasePlanDto) {
    // Validate plan exists and is active
    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { id: dto.planId },
    });

    if (!plan || !plan.isActive || plan.isDeleted) {
      throw new NotFoundException('Plan not found or is not available.');
    }

    if (plan.price === 0) {
      // Free/Trial plan — activate directly without payment
      return this.activateFreePlan(companyId, plan.id);
    }

    // Create a payment record first
    const payment = await this.prisma.subscriptionPayment.create({
      data: {
        companyId,
        planId: plan.id,
        amount: plan.price,
        currency: 'INR',
        status: 'PENDING',
      },
    });

    // Create Razorpay order
    const order = await this.razorpay.createOrder(
      plan.price,
      'INR',
      payment.id,
      {
        planId: plan.id,
        companyId,
        planName: plan.name,
      },
    );

    // Update payment with Razorpay order ID
    await this.prisma.subscriptionPayment.update({
      where: { id: payment.id },
      data: { razorpayOrderId: order.id },
    });

    return {
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: this.razorpay.getKeyId(),
      paymentId: payment.id,
      planName: plan.name,
    };
  }

  /**
   * Step 2: Verify Razorpay payment and activate subscription.
   * NEVER trust frontend payment success.
   */
  async verifyPayment(companyId: string, dto: VerifyPaymentDto) {
    // Find the payment record
    const payment = await this.prisma.subscriptionPayment.findFirst({
      where: {
        companyId,
        razorpayOrderId: dto.razorpayOrderId,
        status: 'PENDING',
      },
    });

    if (!payment) {
      throw new BadRequestException('Payment record not found or already processed.');
    }

    // Verify signature
    const isValid = this.razorpay.verifySignature(
      dto.razorpayOrderId,
      dto.razorpayPaymentId,
      dto.razorpaySignature,
    );

    if (!isValid) {
      // Mark payment as failed
      await this.prisma.subscriptionPayment.update({
        where: { id: payment.id },
        data: {
          status: 'FAILED',
          razorpayPaymentId: dto.razorpayPaymentId,
          razorpaySignature: dto.razorpaySignature,
        },
      });

      // Create failure notification
      await this.createNotification(companyId, 'PAYMENT_FAILED', 'Payment Failed',
        'Your payment could not be verified. Please try again or contact support.');

      throw new BadRequestException('Payment verification failed. Signature mismatch.');
    }

    // Payment verified — update payment record and subscription atomically
    const { notificationType, planName, planPrice } = await this.prisma.$transaction(async (tx) => {
      // Optimitic locking: ensures only one concurrent request can mark it as SUCCESS
      const updatedPayment = await tx.subscriptionPayment.updateMany({
        where: { id: payment.id, status: 'PENDING' },
        data: {
          status: 'SUCCESS',
          razorpayPaymentId: dto.razorpayPaymentId,
          razorpaySignature: dto.razorpaySignature,
          paymentDate: new Date(),
        },
      });

      if (updatedPayment.count === 0) {
        throw new BadRequestException('Payment was already processed.');
      }

      // Activate subscription
      const plan = await tx.subscriptionPlan.findUnique({
        where: { id: payment.planId },
      });

      if (!plan) {
        throw new NotFoundException('Plan not found.');
      }

      const expiryDate = this.calculateExpiryDate(plan.billingCycle);

      // Determine if this is an upgrade, downgrade, or new purchase
      const existingSub = await tx.companySubscription.findUnique({
        where: { companyId },
        include: { plan: true },
      });

      let type: 'SUBSCRIPTION_PURCHASED' | 'PLAN_UPGRADED' | 'PLAN_DOWNGRADED' = 'SUBSCRIPTION_PURCHASED';

      if (existingSub) {
        const rankOrder = { TRIAL: 0, BRONZE: 1, SILVER: 2, GOLD: 3 };
        const oldRank = rankOrder[existingSub.plan.rank];
        const newRank = rankOrder[plan.rank];
        type = newRank > oldRank ? 'PLAN_UPGRADED' : newRank < oldRank ? 'PLAN_DOWNGRADED' : 'SUBSCRIPTION_PURCHASED';

        // Update existing subscription
        await tx.companySubscription.update({
          where: { companyId },
          data: {
            planId: plan.id,
            status: 'ACTIVE',
            startDate: new Date(),
            expiryDate,
            paymentId: payment.id,
          },
        });
      } else {
        // Create new subscription
        await tx.companySubscription.create({
          data: {
            companyId,
            planId: plan.id,
            status: 'ACTIVE',
            startDate: new Date(),
            expiryDate,
            paymentId: payment.id,
          },
        });
      }

      return { notificationType: type, planName: plan.name, planPrice: plan.price };
    });

    // Ensure usage record exists
    await this.usage.getOrCreateUsage(companyId);

    // Create notification
    const notifTitles = {
      SUBSCRIPTION_PURCHASED: 'Subscription Purchased',
      PLAN_UPGRADED: 'Plan Upgraded',
      PLAN_DOWNGRADED: 'Plan Downgraded',
    };
    await this.createNotification(companyId, notificationType, notifTitles[notificationType],
      `Your subscription has been updated to the ${planName} plan.`);

    await this.createNotification(companyId, 'PAYMENT_SUCCESS', 'Payment Successful',
      `Payment of ₹${planPrice} for ${planName} was successful.`);

    return {
      success: true,
      message: 'Payment verified and subscription activated.',
      subscription: await this.getCurrentSubscription(companyId),
    };
  }

  /**
   * Activate a free/trial plan without payment.
   */
  private async activateFreePlan(companyId: string, planId: string) {
    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) throw new NotFoundException('Plan not found.');

    const expiryDate = this.calculateExpiryDate(plan.billingCycle);

    await this.prisma.$transaction(async (tx) => {
      const existingSub = await tx.companySubscription.findUnique({
        where: { companyId },
      });

      if (existingSub) {
        await tx.companySubscription.update({
          where: { companyId },
          data: {
            planId,
            status: plan.rank === 'TRIAL' ? 'TRIAL' : 'ACTIVE',
            startDate: new Date(),
            expiryDate,
          },
        });
      } else {
        await tx.companySubscription.create({
          data: {
            companyId,
            planId,
            status: plan.rank === 'TRIAL' ? 'TRIAL' : 'ACTIVE',
            startDate: new Date(),
            expiryDate,
          },
        });
      }
    });

    // Ensure usage record exists
    await this.usage.getOrCreateUsage(companyId);

    await this.createNotification(companyId, 'SUBSCRIPTION_PURCHASED', 'Subscription Activated',
      `You are now on the ${plan.name} plan.`);

    return {
      success: true,
      message: `${plan.name} activated successfully.`,
      subscription: await this.getCurrentSubscription(companyId),
    };
  }

  /**
   * Renew the current subscription.
   */
  async renewSubscription(companyId: string) {
    const subscription = await this.prisma.companySubscription.findUnique({
      where: { companyId },
      include: { plan: true },
    });

    if (!subscription) {
      throw new BadRequestException('No subscription found to renew.');
    }

    // For free plans, just extend the expiry
    if (subscription.plan.price === 0) {
      const expiryDate = this.calculateExpiryDate(subscription.plan.billingCycle);
      await this.prisma.companySubscription.update({
        where: { companyId },
        data: { status: subscription.plan.rank === 'TRIAL' ? 'TRIAL' : 'ACTIVE', expiryDate },
      });
      return { success: true, message: 'Subscription renewed successfully.' };
    }

    // For paid plans, create a purchase flow
    return this.purchasePlan(companyId, { planId: subscription.planId });
  }

  /**
   * Upgrade to a different plan.
   */
  async upgradeSubscription(companyId: string, dto: PurchasePlanDto) {
    return this.purchasePlan(companyId, dto);
  }

  /**
   * Cancel subscription.
   */
  async cancelSubscription(companyId: string) {
    const subscription = await this.prisma.companySubscription.findUnique({
      where: { companyId },
    });

    if (!subscription) {
      throw new BadRequestException('No subscription found to cancel.');
    }

    await this.prisma.companySubscription.update({
      where: { companyId },
      data: { status: 'CANCELLED' },
    });

    return { success: true, message: 'Subscription cancelled successfully.' };
  }

  /**
   * Get payment history for a company.
   */
  async getPaymentHistory(companyId: string) {
    const payments = await this.prisma.subscriptionPayment.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    });

    return { success: true, payments };
  }

  /**
   * Auto-assign trial plan to a new company.
   */
  async assignTrialPlan(companyId: string) {
    const trialPlan = await this.prisma.subscriptionPlan.findFirst({
      where: { rank: 'TRIAL', isActive: true, isDeleted: false },
    });

    if (!trialPlan) {
      // No trial plan configured — skip auto-assignment
      return null;
    }

    const expiryDate = this.calculateExpiryDate(trialPlan.billingCycle);

    const { subscription, isNew } = await this.prisma.$transaction(async (tx) => {
      const existingSub = await tx.companySubscription.findUnique({
        where: { companyId },
      });

      if (existingSub) {
        return { subscription: existingSub, isNew: false };
      }

      const newSub = await tx.companySubscription.create({
        data: {
          companyId,
          planId: trialPlan.id,
          status: 'TRIAL',
          startDate: new Date(),
          expiryDate,
        },
      });
      return { subscription: newSub, isNew: true };
    });

    if (isNew) {
      // Create usage record
      await this.usage.getOrCreateUsage(companyId);

      await this.createNotification(companyId, 'SUBSCRIPTION_PURCHASED', 'Welcome to BillTea!',
        `Your trial plan has been activated. Enjoy exploring all features!`);
    }

    return subscription;
  }

  // ─── Helpers ──────────────────────────────────────────────

  private calculateExpiryDate(billingCycle: string): Date {
    const now = new Date();
    if (billingCycle === 'YEARLY') {
      return new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
    }
    // MONTHLY
    return new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
  }

  private async createNotification(
    companyId: string,
    type: string,
    title: string,
    message: string,
  ) {
    try {
      await this.prisma.notification.create({
        data: {
          companyId,
          type: type as any,
          title,
          message,
        },
      });
    } catch (error) {
      // Don't let notification failures break the main flow
      console.error('Failed to create notification:', error);
    }
  }
}
