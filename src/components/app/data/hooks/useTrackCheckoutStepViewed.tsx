import useOncePerLocationKey from '@/components/app/data/hooks/useOncePerLocationKey';
import EVENT_NAMES, { CheckoutEventStep } from '@/constants/events';
import {
  CheckoutProductProperties,
  claimCheckoutStarted,
  isCheckoutEventsV2Enabled,
  sendCheckoutEvent,
} from '@/utils/checkoutEvents';

interface UseTrackCheckoutStepViewedArgs {
  eventName: string;
  step: CheckoutEventStep;
  /** From the caller's `useCheckoutEventProductProperties()`, so it isn't fetched twice. */
  product: CheckoutProductProperties;
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
  product,
  isActive,
  isEntryStep = false,
}: UseTrackCheckoutStepViewedArgs) => {
  useOncePerLocationKey(isActive, () => {
    if (isEntryStep && isCheckoutEventsV2Enabled() && claimCheckoutStarted()) {
      sendCheckoutEvent({ eventName: EVENT_NAMES.CHECKOUT.CHECKOUT_STARTED, product, step });
    }
    sendCheckoutEvent({ eventName, product, step });
  });
};

export default useTrackCheckoutStepViewed;
