import { logError } from '@edx/frontend-platform/logging';

import { CheckoutStepKey, CheckoutSubstepKey } from '../constants/checkout';
import EVENT_NAMES, { TRACKED_FIELDS } from '../constants/events';
import { sendEnterpriseCheckoutTrackingEvent } from '../utils/common';

const SENSITIVE_FIELDS = new Set<string>([
  TRACKED_FIELDS.PASSWORD,
  TRACKED_FIELDS.ADMIN_EMAIL,
]);

interface TrackFieldBlurParams {
  fieldName: string;
  step: CheckoutStepKey | CheckoutSubstepKey | undefined;
  substep?: CheckoutSubstepKey | null;
  checkoutIntentId: number | null;
  additionalProperties?: Record<string, any>;
}

/**
 * Function to track field blur events with Segment analytics.
 *
 * @param {TrackFieldBlurParams} params - Configuration for field tracking
 *
 * @example
 * <input onBlur={() => trackFieldBlur({
 *   fieldName: 'fullName',
 *   step: 'plan_details',
 *   checkoutIntentId: 123,
 *   additionalProperties: { plan_type: 'teams' }
 * })} />
 */
export const trackFieldBlur = ({
  fieldName,
  step,
  substep,
  checkoutIntentId = null,
  additionalProperties = {},
}: TrackFieldBlurParams): void => {
  try {
    const sanitizedProperties = Object.fromEntries(
      Object.entries(additionalProperties).filter(([key]) => !SENSITIVE_FIELDS.has(key)),
    );

    sendEnterpriseCheckoutTrackingEvent({
      checkoutIntentId,
      eventName: EVENT_NAMES.SUBSCRIPTION_CHECKOUT.CHECKOUT_FIELD_BLURRED,
      properties: {
        step,
        ...(substep != null ? { substep } : {}),
        field_name: fieldName,
        ...sanitizedProperties,
      },
    });
  } catch (error) {
    logError(`Failed to send tracking event for field: ${fieldName} on step: ${step}`, error);
  }
};
