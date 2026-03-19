import { logError } from '@edx/frontend-platform/logging';
import { useCallback, useEffect, useRef } from 'react';

import { TRACKING_EVENT_NAMES } from '../constants/tracking';
import { sendEnterpriseCheckoutTrackingEvent } from '../utils/common';

interface UseDebounceTrackingParams {
  fieldName: string;
  step: string;
  checkoutIntentId: number | null;
  additionalProperties?: Record<string, any>;
  debounceMs?: number;
}

/**
 * Custom hook to track field blur events with debouncing to avoid excessive event volume.
 * Particularly useful for fields like URL slugs that may trigger validation/updates frequently.
 *
 * @param {UseDebounceTrackingParams} params - Configuration for debounced tracking
 * @returns {Function} onBlur handler to attach to form fields
 *
 * @example
 * const handleBlur = useDebounceTracking({
 *   fieldName: 'urlSlug',
 *   step: 'account_details',
 *   checkoutIntentId: 123,
 *   additionalProperties: { plan_type: 'teams', org_slug: 'my-org' },
 *   debounceMs: 500
 * });
 *
 * <input onBlur={handleBlur} />
 */
export const useDebounceTracking = ({
  fieldName,
  step,
  checkoutIntentId,
  additionalProperties = {},
  debounceMs = 500,
}: UseDebounceTrackingParams) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  const handleBlur = useCallback(() => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for tracking event
    timeoutRef.current = setTimeout(() => {
      try {
        sendEnterpriseCheckoutTrackingEvent({
          checkoutIntentId,
          eventName: TRACKING_EVENT_NAMES.CHECKOUT_FIELD_BLUR,
          properties: {
            step,
            field_name: fieldName,
            ...additionalProperties,
          },
        });
      } catch (error) {
        logError(`Failed to send debounced tracking event for field: ${fieldName}`, error);
      }
    }, debounceMs);
  }, [fieldName, step, checkoutIntentId, additionalProperties, debounceMs]);

  return handleBlur;
};
