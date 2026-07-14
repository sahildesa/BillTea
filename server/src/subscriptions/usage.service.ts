import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsageService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get or create usage record for a company.
   */
  async getOrCreateUsage(companyId: string) {
    return this.prisma.companyUsage.upsert({
      where: { companyId },
      create: { companyId },
      update: {},
    });
  }

  /**
   * Check if a company can create a resource based on its subscription limits.
   * Returns true if allowed, throws BadRequestException if not.
   */
  async checkLimit(companyId: string, resource: 'quotation' | 'invoice' | 'customer' | 'product' | 'whatsapp') {
    const subscription = await this.prisma.companySubscription.findUnique({
      where: { companyId },
      include: { plan: true },
    });

    if (!subscription) {
      throw new BadRequestException('No active subscription found. Please subscribe to a plan.');
    }

    if (subscription.status === 'EXPIRED') {
      throw new BadRequestException('Your subscription has expired. Renew now to continue using BillTea.');
    }

    if (subscription.status === 'CANCELLED') {
      throw new BadRequestException('Your subscription has been cancelled. Please subscribe to a new plan.');
    }

    // Check if subscription has expired by date
    if (new Date() > subscription.expiryDate) {
      // Auto-update status to EXPIRED
      await this.prisma.companySubscription.update({
        where: { id: subscription.id },
        data: { status: 'EXPIRED' },
      });
      throw new BadRequestException('Your subscription has expired. Renew now to continue using BillTea.');
    }

    const plan = subscription.plan;
    const usage = await this.getOrCreateUsage(companyId);

    const limitMap: Record<string, { limit: number; used: number; label: string }> = {
      quotation: { limit: plan.quotationLimit, used: usage.quotationsUsed, label: 'Quotation' },
      invoice: { limit: plan.invoiceLimit, used: usage.invoicesUsed, label: 'Invoice' },
      customer: { limit: plan.customerLimit, used: usage.customersUsed, label: 'Customer' },
      product: { limit: plan.productLimit, used: usage.productsUsed, label: 'Product' },
      whatsapp: { limit: plan.whatsappMessageLimit, used: usage.whatsappMessagesSent, label: 'WhatsApp message' },
    };

    const check = limitMap[resource];
    if (!check) return true;

    // 0 means unlimited
    if (check.limit === 0) return true;

    if (check.used >= check.limit) {
      throw new BadRequestException(
        `${check.label} limit reached (${check.used}/${check.limit}). Upgrade your subscription to continue.`,
      );
    }

    return true;
  }

  /**
   * Check branch limit by counting existing branches.
   */
  async checkBranchLimit(companyId: string) {
    const subscription = await this.prisma.companySubscription.findUnique({
      where: { companyId },
      include: { plan: true },
    });

    if (!subscription || subscription.status === 'EXPIRED' || subscription.status === 'CANCELLED') {
      throw new BadRequestException('No active subscription. Please subscribe to a plan.');
    }

    if (new Date() > subscription.expiryDate) {
      await this.prisma.companySubscription.update({
        where: { id: subscription.id },
        data: { status: 'EXPIRED' },
      });
      throw new BadRequestException('Your subscription has expired. Renew now to continue using BillTea.');
    }

    const plan = subscription.plan;
    if (plan.branchLimit === 0) return true; // Unlimited

    const branchCount = await this.prisma.branch.count({
      where: { companyId, isActive: true },
    });

    if (branchCount >= plan.branchLimit) {
      throw new BadRequestException(
        `Branch limit reached (${branchCount}/${plan.branchLimit}). Upgrade your subscription to continue.`,
      );
    }

    return true;
  }

  /**
   * Check staff limit by counting existing staff.
   */
  async checkStaffLimit(companyId: string) {
    const subscription = await this.prisma.companySubscription.findUnique({
      where: { companyId },
      include: { plan: true },
    });

    if (!subscription || subscription.status === 'EXPIRED' || subscription.status === 'CANCELLED') {
      throw new BadRequestException('No active subscription. Please subscribe to a plan.');
    }

    if (new Date() > subscription.expiryDate) {
      await this.prisma.companySubscription.update({
        where: { id: subscription.id },
        data: { status: 'EXPIRED' },
      });
      throw new BadRequestException('Your subscription has expired. Renew now to continue using BillTea.');
    }

    const plan = subscription.plan;
    if (plan.staffLimit === 0) return true; // Unlimited

    const staffCount = await this.prisma.user.count({
      where: { companyId, isActive: true },
    });

    if (staffCount >= plan.staffLimit) {
      throw new BadRequestException(
        `Staff limit reached (${staffCount}/${plan.staffLimit}). Upgrade your subscription to continue.`,
      );
    }

    return true;
  }

  /**
   * Check if a feature is enabled for the company's subscription.
   */
  async checkFeature(companyId: string, feature: 'customQuotationThemes' | 'customInvoiceThemes' | 'whatsappIntegration') {
    const subscription = await this.prisma.companySubscription.findUnique({
      where: { companyId },
      include: { plan: true },
    });

    if (!subscription) {
      throw new BadRequestException('No active subscription found.');
    }

    if (!subscription.plan[feature]) {
      const featureLabels: Record<string, string> = {
        customQuotationThemes: 'Custom Quotation Themes',
        customInvoiceThemes: 'Custom Invoice Themes',
        whatsappIntegration: 'WhatsApp Integration',
      };
      throw new BadRequestException(
        `${featureLabels[feature]} is not included in your current plan. Upgrade to access this feature.`,
      );
    }

    return true;
  }

  // ─── Usage Increment Methods ──────────────────────────────

  async incrementQuotationUsage(companyId: string) {
    const usage = await this.getOrCreateUsage(companyId);
    await this.prisma.companyUsage.update({
      where: { id: usage.id },
      data: { quotationsUsed: { increment: 1 } },
    });
  }

  async incrementInvoiceUsage(companyId: string) {
    const usage = await this.getOrCreateUsage(companyId);
    await this.prisma.companyUsage.update({
      where: { id: usage.id },
      data: { invoicesUsed: { increment: 1 } },
    });
  }

  async incrementCustomerUsage(companyId: string) {
    const usage = await this.getOrCreateUsage(companyId);
    await this.prisma.companyUsage.update({
      where: { id: usage.id },
      data: { customersUsed: { increment: 1 } },
    });
  }

  async incrementProductUsage(companyId: string) {
    const usage = await this.getOrCreateUsage(companyId);
    await this.prisma.companyUsage.update({
      where: { id: usage.id },
      data: { productsUsed: { increment: 1 } },
    });
  }

  async incrementWhatsappUsage(companyId: string) {
    const usage = await this.getOrCreateUsage(companyId);
    await this.prisma.companyUsage.update({
      where: { id: usage.id },
      data: { whatsappMessagesSent: { increment: 1 } },
    });
  }

  /**
   * Get full usage info with limits and remaining counts.
   */
  async getUsageWithLimits(companyId: string) {
    const subscription = await this.prisma.companySubscription.findUnique({
      where: { companyId },
      include: { plan: true },
    });

    if (!subscription) return null;

    const usage = await this.getOrCreateUsage(companyId);
    const plan = subscription.plan;

    const branchCount = await this.prisma.branch.count({
      where: { companyId, isActive: true },
    });

    const staffCount = await this.prisma.user.count({
      where: { companyId, isActive: true },
    });

    return {
      quotations: { limit: plan.quotationLimit, used: usage.quotationsUsed, remaining: plan.quotationLimit === 0 ? -1 : plan.quotationLimit - usage.quotationsUsed },
      invoices: { limit: plan.invoiceLimit, used: usage.invoicesUsed, remaining: plan.invoiceLimit === 0 ? -1 : plan.invoiceLimit - usage.invoicesUsed },
      customers: { limit: plan.customerLimit, used: usage.customersUsed, remaining: plan.customerLimit === 0 ? -1 : plan.customerLimit - usage.customersUsed },
      products: { limit: plan.productLimit, used: usage.productsUsed, remaining: plan.productLimit === 0 ? -1 : plan.productLimit - usage.productsUsed },
      branches: { limit: plan.branchLimit, used: branchCount, remaining: plan.branchLimit === 0 ? -1 : plan.branchLimit - branchCount },
      staff: { limit: plan.staffLimit, used: staffCount, remaining: plan.staffLimit === 0 ? -1 : plan.staffLimit - staffCount },
      whatsappMessages: { limit: plan.whatsappMessageLimit, used: usage.whatsappMessagesSent, remaining: plan.whatsappMessageLimit === 0 ? -1 : plan.whatsappMessageLimit - usage.whatsappMessagesSent },
    };
  }
}
