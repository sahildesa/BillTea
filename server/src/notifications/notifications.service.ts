import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get all notifications for a company.
   */
  async findAll(companyId: string) {
    const notifications = await this.prisma.notification.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const unreadCount = await this.prisma.notification.count({
      where: { companyId, isRead: false },
    });

    return { success: true, notifications, unreadCount };
  }

  /**
   * Mark a notification as read.
   */
  async markAsRead(id: string, companyId: string) {
    await this.prisma.notification.updateMany({
      where: { id, companyId },
      data: { isRead: true },
    });

    return { success: true, message: 'Notification marked as read.' };
  }

  /**
   * Mark all notifications as read.
   */
  async markAllAsRead(companyId: string) {
    await this.prisma.notification.updateMany({
      where: { companyId, isRead: false },
      data: { isRead: true },
    });

    return { success: true, message: 'All notifications marked as read.' };
  }
}
