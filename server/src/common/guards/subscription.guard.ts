import { Injectable, CanActivate, ExecutionContext, BadRequestException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { REQUIRE_SUBSCRIPTION_KEY } from '../decorators/subscription.decorator';
import { UsageService } from '../../subscriptions/usage.service';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private usageService: UsageService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requirement = this.reflector.getAllAndOverride(REQUIRE_SUBSCRIPTION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no @RequireSubscription decorator, allow
    if (!requirement) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user?.companyId) {
      throw new BadRequestException('Company is required for this operation.');
    }

    // SUPER_ADMIN bypasses subscription checks
    if (user.role === 'SUPER_ADMIN') return true;

    const companyId = user.companyId;

    if (typeof requirement === 'string') {
      // Check specific resource limit
      if (requirement === 'branch') {
        await this.usageService.checkBranchLimit(companyId);
      } else if (requirement === 'staff') {
        await this.usageService.checkStaffLimit(companyId);
      } else {
        await this.usageService.checkLimit(companyId, requirement as any);
      }
    } else {
      // Just check that subscription is active (no specific resource)
      await this.usageService.checkLimit(companyId, 'quotation');
      // The checkLimit method validates subscription status regardless of resource
    }

    return true;
  }
}
