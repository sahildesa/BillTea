import { SetMetadata } from '@nestjs/common';

export const REQUIRE_FEATURE_KEY = 'requireFeature';

/**
 * Decorator to require a specific feature to be enabled in the company's subscription plan.
 * 
 * Usage:
 * @RequireFeature('customQuotationThemes')
 * @RequireFeature('customInvoiceThemes')
 * @RequireFeature('whatsappIntegration')
 */
export const RequireFeature = (feature: string) =>
  SetMetadata(REQUIRE_FEATURE_KEY, feature);
