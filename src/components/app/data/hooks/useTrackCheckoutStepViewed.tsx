import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

import useCheckoutEventProductProperties from '@/components/app/data/hooks/useCheckoutEventProductProperties';
import EVENT_NAMES, { CheckoutEventStep } from '@/constants/events';
import { claimCheckoutStarted, isCheckoutEventsV2Enabled, sendCheckoutEvent } from '@/utils/checkoutEvents';

interface UseTrackCheckoutStepViewedArgs {
  eventName: string;
  step: CheckoutEventStep;
  /** Only fire while the step's main page (not a substep) is active. */
  isActive: boolean;
  /** Also fire `checkout_started`, once per session, on the first view of this step. */
  isEntryStep?: boolean;
}

/**
 * Fires `checkout_step_viewed.<step>` on every visit to a step, including backward navigation.
 * Visits are keyed on the router location key, so re-renders don't produce duplicate views.
 */
const useTrackCheckoutStepViewed = ({
  eventName,
  step,
  isActive,
  isEntryStep = false,
}: UseTrackCheckoutStepViewedArgs) => {
  const { key: locationKey } = useLocation();
  const product = useCheckoutEventProductProperties();
  const lastTrackedLocationKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isActive || lastTrackedLocationKeyRef.current === locationKey) {
      return;
    }
    lastTrackedLocationKeyRef.current = locationKey;

    if (isEntryStep && isCheckoutEventsV2Enabled() && claimCheckoutStarted()) {
      sendCheckoutEvent({ eventName: EVENT_NAMES.CHECKOUT.CHECKOUT_STARTED, product, step });
    }
    sendCheckoutEvent({ eventName, product, step });
  }, [eventName, isActive, isEntryStep, locationKey, product, step]);
};

export default useTrackCheckoutStepViewed;
