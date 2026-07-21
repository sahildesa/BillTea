import { SetMetadata } from '@nestjs/common';

export const REQUIRE_SUBSCRIPTION_KEY = 'requireSubscription';

/**
 * Decorator to require an active subscription for the endpoint.
 * Optionally specify the resource type to check usage limits.
 * 
 * Usage:
 * @RequireSubscription()                    // Just check active subscription
 * @RequireSubscription('quotation')         // Check active sub + quotation limit
 * @RequireSubscription('branch')            // Check active sub + branch limit (count-based)
 * @RequireSubscription('staff')             // Check active sub + staff limit (count-based)
 */
export const RequireSubscription = (resource?: string) =>
  SetMetadata(REQUIRE_SUBSCRIPTION_KEY, resource || true);
