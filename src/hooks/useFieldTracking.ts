import { logError } from '@edx/frontend-platform/logging';

import { CheckoutStepKey, CheckoutSubstepKey } from '../constants/checkout';
import EVENT_NAMES from '../constants/events';
import { getPlanType } from '../utils/checkout';
import { sendEnterpriseCheckoutTrackingEvent } from '../utils/common';

interface TrackFieldBlurParams {
  fieldName: string;
  step: CheckoutStepKey | CheckoutSubstepKey;
  checkoutIntentId: number | null;
  lookupKey?: string | null;
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
  checkoutIntentId = null,
  additionalProperties = {},
}: TrackFieldBlurParams): void => {
  try {
    sendEnterpriseCheckoutTrackingEvent({
      checkoutIntentId,
      eventName: EVENT_NAMES.SUBSCRIPTION_CHECKOUT.CHECKOUT_FIELD_BLURRED,
      properties: {
        step,
        field_name: fieldName,
        ...additionalProperties,
      },
    });
  } catch (error) {
    logError(`Failed to send tracking event for field: ${fieldName}`, error);
  }
};
