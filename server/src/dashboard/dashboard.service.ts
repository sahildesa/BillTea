import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats(companyId: string, branchId?: string) {
    const branchFilter = branchId ? { branchId } : {};
    const whereFilter = { companyId, ...branchFilter };

    const now = new Date();
    
    // Dates for previous month comparison
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(now.getMonth() - 1);
    
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(now.getMonth() - 2);

    // Fetch KPIs
    const currentMonthInvoices = await this.prisma.invoice.count({
      where: { ...whereFilter, invoiceDate: { gte: oneMonthAgo } },
    });
    const previousMonthInvoices = await this.prisma.invoice.count({
      where: { ...whereFilter, invoiceDate: { gte: twoMonthsAgo, lt: oneMonthAgo } },
    });

    const totalInvoices = await this.prisma.invoice.count({ where: whereFilter });
    
    const totalQuotations = await this.prisma.quotation.count({ where: whereFilter });
    const currentMonthQuotations = await this.prisma.quotation.count({
      where: { ...whereFilter, quotationDate: { gte: oneMonthAgo } },
    });
    const previousMonthQuotations = await this.prisma.quotation.count({
      where: { ...whereFilter, quotationDate: { gte: twoMonthsAgo, lt: oneMonthAgo } },
    });

    const totalCustomers = await this.prisma.customer.count({ where: whereFilter });
    const currentMonthCustomers = await this.prisma.customer.count({
      where: { ...whereFilter, createdAt: { gte: oneMonthAgo } },
    });
    const previousMonthCustomers = await this.prisma.customer.count({
      where: { ...whereFilter, createdAt: { gte: twoMonthsAgo, lt: oneMonthAgo } },
    });

    // Total sales (paid invoices)
    const totalSalesAggr = await this.prisma.invoice.aggregate({
      where: { ...whereFilter, status: 'PAID' },
      _sum: { grandTotal: true },
    });
    const totalSales = totalSalesAggr._sum.grandTotal || 0;

    const currentMonthSalesAggr = await this.prisma.invoice.aggregate({
      where: { ...whereFilter, status: 'PAID', invoiceDate: { gte: oneMonthAgo } },
      _sum: { grandTotal: true },
    });
    const previousMonthSalesAggr = await this.prisma.invoice.aggregate({
      where: { ...whereFilter, status: 'PAID', invoiceDate: { gte: twoMonthsAgo, lt: oneMonthAgo } },
      _sum: { grandTotal: true },
    });

    const currentSales = currentMonthSalesAggr._sum.grandTotal || 0;
    const previousSales = previousMonthSalesAggr._sum.grandTotal || 0;

    const calcPercentage = (current: number, prev: number) => {
      if (prev === 0) return current > 0 ? 100 : 0;
      return Number((((current - prev) / prev) * 100).toFixed(2));
    };

    const kpis = {
      totalInvoices,
      invoicesChange: calcPercentage(currentMonthInvoices, previousMonthInvoices),
      totalQuotations,
      quotationsChange: calcPercentage(currentMonthQuotations, previousMonthQuotations),
      totalSales,
      salesChange: calcPercentage(currentSales, previousSales),
      totalCustomers,
      customersChange: calcPercentage(currentMonthCustomers, previousMonthCustomers),
    };

    // Sales Trends (Past 28 Days)
    const twentyEightDaysAgo = new Date();
    twentyEightDaysAgo.setDate(now.getDate() - 28);
    twentyEightDaysAgo.setHours(0, 0, 0, 0);

    const recentInvoices = await this.prisma.invoice.findMany({
      where: { ...whereFilter, invoiceDate: { gte: twentyEightDaysAgo } },
      select: { invoiceDate: true, grandTotal: true },
    });
    
    const recentQuotations = await this.prisma.quotation.findMany({
      where: { ...whereFilter, quotationDate: { gte: twentyEightDaysAgo } },
      select: { quotationDate: true, grandTotal: true },
    });

    const salesTrend = [];
    for (let i = 0; i < 28; i++) {
      const targetDate = new Date(twentyEightDaysAgo);
      targetDate.setDate(twentyEightDaysAgo.getDate() + i);
      const dateString = targetDate.toISOString().split('T')[0];

      const dailyInvoices = recentInvoices.filter(
        (inv) => inv.invoiceDate.toISOString().split('T')[0] === dateString
      );
      const dailyQuotations = recentQuotations.filter(
        (quo) => quo.quotationDate.toISOString().split('T')[0] === dateString
      );

      salesTrend.push({
        date: dateString,
        invoices: dailyInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0),
        quotations: dailyQuotations.reduce((sum, quo) => sum + quo.grandTotal, 0),
      });
    }

    // Weekly Counts (Past 6 Weeks)
    const sixWeeksAgo = new Date();
    sixWeeksAgo.setDate(now.getDate() - 42);
    sixWeeksAgo.setHours(0, 0, 0, 0);

    const weeklyInvoices = await this.prisma.invoice.findMany({
      where: { ...whereFilter, invoiceDate: { gte: sixWeeksAgo } },
      select: { invoiceDate: true },
    });

    const weeklyQuotations = await this.prisma.quotation.findMany({
      where: { ...whereFilter, quotationDate: { gte: sixWeeksAgo } },
      select: { quotationDate: true },
    });

    const weeklyCounts = [];
    for (let i = 0; i < 6; i++) {
      const weekStart = new Date(sixWeeksAgo);
      weekStart.setDate(sixWeeksAgo.getDate() + (i * 7));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7);

      const wInvoices = weeklyInvoices.filter(
        (inv) => inv.invoiceDate >= weekStart && inv.invoiceDate < weekEnd
      ).length;
      
      const wQuotations = weeklyQuotations.filter(
        (quo) => quo.quotationDate >= weekStart && quo.quotationDate < weekEnd
      ).length;

      weeklyCounts.push({
        week: `W${i + 1}`,
        invoices: wInvoices,
        quotations: wQuotations,
      });
    }

    // Reminders
    const invoiceReminders = await this.prisma.invoice.findMany({
      where: {
        ...whereFilter,
        status: { in: ['UNPAID', 'OVERDUE'] },
      },
      orderBy: { dueDate: 'asc' },
      take: 5,
      include: { customer: { select: { customerName: true } } },
    });

    const quotationFollowups = await this.prisma.quotation.findMany({
      where: {
        ...whereFilter,
        status: { in: ['DRAFT', 'SENT'] },
      },
      orderBy: { updatedAt: 'desc' },
      take: 5,
      include: { customer: { select: { customerName: true } } },
    });

    return {
      kpis,
      salesTrend,
      weeklyCounts,
      invoiceReminders,
      quotationFollowups,
    };
  }
}
