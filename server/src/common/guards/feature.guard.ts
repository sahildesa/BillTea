import { Injectable, CanActivate, ExecutionContext, BadRequestException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { REQUIRE_FEATURE_KEY } from '../decorators/feature.decorator';
import { UsageService } from '../../subscriptions/usage.service';

@Injectable()
export class FeatureGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private usageService: UsageService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const feature = this.reflector.getAllAndOverride<string>(REQUIRE_FEATURE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no @RequireFeature decorator, allow
    if (!feature) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user?.companyId) {
      throw new BadRequestException('Company is required for this operation.');
    }

    // SUPER_ADMIN bypasses feature checks
    if (user.role === 'SUPER_ADMIN') return true;

    await this.usageService.checkFeature(user.companyId, feature as any);

    return true;
  }
}
