import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';

@Injectable()
export class SubscriptionPlansService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new subscription plan.
   */
  async create(dto: CreatePlanDto) {
    // Validate unique displayOrder
    const existingOrder = await this.prisma.subscriptionPlan.findUnique({
      where: { displayOrder: dto.displayOrder },
    });
    if (existingOrder && !existingOrder.isDeleted) {
      throw new ConflictException(`Display order ${dto.displayOrder} is already in use.`);
    }

    // Only one active Trial plan at a time
    if (dto.rank === 'TRIAL' && dto.isActive !== false) {
      const existingTrial = await this.prisma.subscriptionPlan.findFirst({
        where: { rank: 'TRIAL', isActive: true, isDeleted: false },
      });
      if (existingTrial) {
        throw new ConflictException('Only one active Trial plan is allowed at a time.');
      }
    }

    const plan = await this.prisma.subscriptionPlan.create({
      data: {
        name: dto.name,
        rank: dto.rank,
        description: dto.description || '',
        displayOrder: dto.displayOrder,
        isActive: dto.isActive ?? true,
        isRecommended: dto.isRecommended ?? false,
        price: dto.price,
        billingCycle: dto.billingCycle,
        quotationLimit: dto.quotationLimit ?? 0,
        invoiceLimit: dto.invoiceLimit ?? 0,
        customerLimit: dto.customerLimit ?? 0,
        productLimit: dto.productLimit ?? 0,
        branchLimit: dto.branchLimit ?? 0,
        staffLimit: dto.staffLimit ?? 0,
        whatsappMessageLimit: dto.whatsappMessageLimit ?? 0,
        customQuotationThemes: dto.customQuotationThemes ?? false,
        customInvoiceThemes: dto.customInvoiceThemes ?? false,
        whatsappIntegration: dto.whatsappIntegration ?? false,
      },
    });

    return { success: true, plan };
  }

  /**
   * List all plans (including soft-deleted for admin view).
   */
  async findAll() {
    const plans = await this.prisma.subscriptionPlan.findMany({
      orderBy: { displayOrder: 'asc' },
      include: {
        _count: { select: { subscriptions: true } },
      },
    });

    return { success: true, plans };
  }

  /**
   * List only active, non-deleted plans (public/user-facing).
   */
  async findActive() {
    const plans = await this.prisma.subscriptionPlan.findMany({
      where: { isActive: true, isDeleted: false },
      orderBy: { displayOrder: 'asc' },
    });

    return { success: true, plans };
  }

  /**
   * Get a single plan by ID.
   */
  async findOne(id: string) {
    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { id },
      include: {
        _count: { select: { subscriptions: true } },
      },
    });

    if (!plan) {
      throw new NotFoundException('Subscription plan not found.');
    }

    return { success: true, plan };
  }

  /**
   * Update a plan.
   */
  async update(id: string, dto: UpdatePlanDto) {
    const plan = await this.prisma.subscriptionPlan.findUnique({ where: { id } });
    if (!plan) {
      throw new NotFoundException('Subscription plan not found.');
    }

    if (plan.isDeleted) {
      throw new BadRequestException('Cannot update a deleted plan.');
    }

    // Validate unique displayOrder if changed
    if (dto.displayOrder !== undefined && dto.displayOrder !== plan.displayOrder) {
      const existingOrder = await this.prisma.subscriptionPlan.findUnique({
        where: { displayOrder: dto.displayOrder },
      });
      if (existingOrder && existingOrder.id !== id && !existingOrder.isDeleted) {
        throw new ConflictException(`Display order ${dto.displayOrder} is already in use.`);
      }
    }

    // Only one active Trial plan at a time
    const newRank = dto.rank ?? plan.rank;
    const newIsActive = dto.isActive ?? plan.isActive;
    if (newRank === 'TRIAL' && newIsActive) {
      const existingTrial = await this.prisma.subscriptionPlan.findFirst({
        where: { rank: 'TRIAL', isActive: true, isDeleted: false, id: { not: id } },
      });
      if (existingTrial) {
        throw new ConflictException('Only one active Trial plan is allowed at a time.');
      }
    }

    const updatedPlan = await this.prisma.subscriptionPlan.update({
      where: { id },
      data: dto,
    });

    return { success: true, plan: updatedPlan };
  }

  /**
   * Soft delete a plan.
   */
  async remove(id: string) {
    const plan = await this.prisma.subscriptionPlan.findUnique({ where: { id } });
    if (!plan) {
      throw new NotFoundException('Subscription plan not found.');
    }

    await this.prisma.subscriptionPlan.update({
      where: { id },
      data: { isDeleted: true, isActive: false },
    });

    return { success: true, message: 'Plan deleted successfully.' };
  }

  /**
   * Activate a plan.
   */
  async activate(id: string) {
    const plan = await this.prisma.subscriptionPlan.findUnique({ where: { id } });
    if (!plan) {
      throw new NotFoundException('Subscription plan not found.');
    }

    if (plan.isDeleted) {
      throw new BadRequestException('Cannot activate a deleted plan.');
    }

    // Only one active Trial plan at a time
    if (plan.rank === 'TRIAL') {
      const existingTrial = await this.prisma.subscriptionPlan.findFirst({
        where: { rank: 'TRIAL', isActive: true, isDeleted: false, id: { not: id } },
      });
      if (existingTrial) {
        throw new ConflictException('Only one active Trial plan is allowed at a time.');
      }
    }

    const updatedPlan = await this.prisma.subscriptionPlan.update({
      where: { id },
      data: { isActive: true },
    });

    return { success: true, plan: updatedPlan };
  }

  /**
   * Deactivate a plan.
   */
  async deactivate(id: string) {
    const plan = await this.prisma.subscriptionPlan.findUnique({ where: { id } });
    if (!plan) {
      throw new NotFoundException('Subscription plan not found.');
    }

    const updatedPlan = await this.prisma.subscriptionPlan.update({
      where: { id },
      data: { isActive: false },
    });

    return { success: true, plan: updatedPlan };
  }

  /**
   * Get subscription statistics for admin dashboard.
   */
  async getStats() {
    const [totalPlans, activePlans, totalSubscribers, activeSubscribers, expiredSubscribers] =
      await Promise.all([
        this.prisma.subscriptionPlan.count({ where: { isDeleted: false } }),
        this.prisma.subscriptionPlan.count({ where: { isActive: true, isDeleted: false } }),
        this.prisma.companySubscription.count(),
        this.prisma.companySubscription.count({ where: { status: { in: ['ACTIVE', 'TRIAL'] } } }),
        this.prisma.companySubscription.count({ where: { status: 'EXPIRED' } }),
      ]);

    // Monthly revenue (current month)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyPayments = await this.prisma.subscriptionPayment.aggregate({
      where: {
        status: 'SUCCESS',
        paymentDate: { gte: startOfMonth },
      },
      _sum: { amount: true },
    });

    // Yearly revenue (current year)
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const yearlyPayments = await this.prisma.subscriptionPayment.aggregate({
      where: {
        status: 'SUCCESS',
        paymentDate: { gte: startOfYear },
      },
      _sum: { amount: true },
    });

    // Recent payments
    const recentPayments = await this.prisma.subscriptionPayment.findMany({
      where: { status: 'SUCCESS' },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { company: { select: { name: true } } },
    });

    // Expiring soon (within 7 days)
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const expiringSoon = await this.prisma.companySubscription.findMany({
      where: {
        status: { in: ['ACTIVE', 'TRIAL'] },
        expiryDate: { lte: sevenDaysFromNow, gte: now },
      },
      orderBy: { expiryDate: 'asc' },
      take: 10,
      include: {
        company: { select: { name: true } },
        plan: { select: { name: true, rank: true } },
      },
    });

    // Recently purchased
    const recentSubscriptions = await this.prisma.companySubscription.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        company: { select: { name: true } },
        plan: { select: { name: true, rank: true, price: true } },
      },
    });

    return {
      success: true,
      stats: {
        totalPlans,
        activePlans,
        totalSubscribers,
        activeSubscribers,
        expiredSubscribers,
        monthlyRevenue: monthlyPayments._sum.amount ?? 0,
        yearlyRevenue: yearlyPayments._sum.amount ?? 0,
      },
      recentPayments,
      expiringSoon,
      recentSubscriptions,
    };
  }

  /**
   * Get the active trial plan (used for auto-assignment).
   */
  async getActiveTrialPlan() {
    return this.prisma.subscriptionPlan.findFirst({
      where: { rank: 'TRIAL', isActive: true, isDeleted: false },
    });
  }
}
