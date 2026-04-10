import { logError } from '@edx/frontend-platform/logging';

import { CheckoutStepKey, CheckoutSubstepKey } from '../constants/checkout';
import EVENT_NAMES from '../constants/events';
import { sendEnterpriseCheckoutTrackingEvent } from '../utils/common';

interface TrackDebouncedFieldBlurParams {
  fieldName: string;
  step: CheckoutStepKey | undefined;
  substep?: CheckoutSubstepKey | null;
  checkoutIntentId: number | null;
  checkoutIntentUuid: string | null;
  additionalProperties?: Record<string, any>;
  debounceMs?: number;
}

// Module-level variable to store the timeout reference
let timeoutId: NodeJS.Timeout | null = null;

/**
 * Function to track field blur events with debouncing to avoid excessive event volume.
 * Particularly useful for fields like URL slugs that may trigger validation/updates frequently.
 *
 * @param {TrackDebouncedFieldBlurParams} params - Configuration for debounced tracking
 *
 * @example
 * <input onBlur={() => trackDebouncedFieldBlur({
 *   fieldName: 'urlSlug',
 *   step: 'account_details',
 *   checkoutIntentId: 123,
 *   checkoutIntentUuid: 'abc-123-def-456',
 *   additionalProperties: { plan_type: 'teams', org_slug: 'my-org' },
 *   debounceMs: 500
 * })} />
 */
export const trackDebouncedFieldBlur = ({
  fieldName,
  step,
  substep,
  checkoutIntentId,
  checkoutIntentUuid,
  additionalProperties = {},
  debounceMs = 500,
}: TrackDebouncedFieldBlurParams): void => {
  // Clear any existing timeout
  if (timeoutId) {
    clearTimeout(timeoutId);
  }

  // Set new timeout for tracking event
  timeoutId = setTimeout(() => {
    try {
      sendEnterpriseCheckoutTrackingEvent({
        checkoutIntentId,
        checkoutIntentUuid,
        eventName: EVENT_NAMES.SUBSCRIPTION_CHECKOUT.CHECKOUT_FIELD_BLURRED,
        properties: {
          step,
          ...(substep != null ? { substep } : {}),
          field_name: fieldName,
          ...additionalProperties,
        },
      });
    } catch (error) {
      logError(`Failed to send debounced tracking event for field: ${fieldName}`, error);
    } finally {
      timeoutId = null;
    }
  }, debounceMs);
};
