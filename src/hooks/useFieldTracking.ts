import { logError } from '@edx/frontend-platform/logging';
import { useCallback } from 'react';

import EVENT_NAMES from '../constants/events';
import { sendEnterpriseCheckoutTrackingEvent } from '../utils/common';

interface UseFieldTrackingParams {
  fieldName: string;
  step: string;
  checkoutIntentId: number | null;
  additionalProperties?: Record<string, any>;
}

/**
 * Custom hook to track field blur events with Segment analytics.
 *
 * @param {UseFieldTrackingParams} params - Configuration for field tracking
 * @returns {Function} onBlur handler to attach to form fields
 *
 * @example
 * const handleBlur = useFieldTracking({
 *   fieldName: 'fullName',
 *   step: 'plan_details',
 *   checkoutIntentId: 123,
 *   additionalProperties: { plan_type: 'teams' }
 * });
 *
 * <input onBlur={handleBlur} />
 */
export const useFieldTracking = ({
  fieldName,
  step,
  checkoutIntentId,
  additionalProperties = {},
}: UseFieldTrackingParams) => {
  const handleBlur = useCallback(() => {
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
  }, [fieldName, step, checkoutIntentId, additionalProperties]);

  return handleBlur;
};
