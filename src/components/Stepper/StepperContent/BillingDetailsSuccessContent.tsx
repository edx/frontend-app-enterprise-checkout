import { fetchAuthenticatedUser } from '@edx/frontend-platform/auth';
import { AppContext } from '@edx/frontend-platform/react';
import { Stack } from '@openedx/paragon';
import { useQueryClient } from '@tanstack/react-query';
import { useContext, useEffect, useRef } from 'react';

import { useBFFSuccess, useCheckoutEventProductProperties, usePolledCheckoutIntent } from '@/components/app/data';
import { queryBffSuccess } from '@/components/app/data/queries/queries';
import { BillingDetailsHeadingMessage } from '@/components/billing-details-pages/BillingDetailsHeadingMessage';
import { ContactSupport } from '@/components/billing-details-pages/ContactSupport';
import { OrderDetails } from '@/components/billing-details-pages/OrderDetails';
import { SubscriptionStartMessage } from '@/components/billing-details-pages/SubscriptionStartMessage';
import { StatefulProvisioningButton } from '@/components/StatefulButton';
import EVENT_NAMES, { CHECKOUT_EVENT_STEPS } from '@/constants/events';
import { claimBillingStepCompleted, sendCheckoutEvent, wasCheckoutPaymentSubmitted } from '@/utils/checkoutEvents';

const PAID_CHECKOUT_INTENT_STATES: CheckoutIntentState[] = ['paid', 'fulfilled'];

const BillingDetailsSuccessContent = () => {
  const queryClient = useQueryClient();
  const { authenticatedUser }: AppContextValue = useContext(AppContext);
  const { data: successBFFContext, refetch: refetchUseBFFSuccess } = useBFFSuccess(authenticatedUser?.userId ?? null);
  const { checkoutIntent } = successBFFContext || {};
  const { polledCheckoutIntent } = usePolledCheckoutIntent();
  // Track when the Success BFF resyncing is occurring to avoid overlapping calls.
  const resyncSuccessBFFInProgress = useRef(false);
  const checkoutEventProduct = useCheckoutEventProductProperties();

  // Stripe can redirect to this route after confirm(), bypassing the billing page's payment
  // handler. Emit the billing step completion here for a payment submitted in this tab; the
  // shared per-intent claim keeps it to one event whichever path gets there first.
  useEffect(() => {
    if (
      !checkoutIntent?.uuid
      || !PAID_CHECKOUT_INTENT_STATES.includes(checkoutIntent.state)
      || !wasCheckoutPaymentSubmitted(checkoutIntent.uuid)
      || !claimBillingStepCompleted(checkoutIntent.uuid)
    ) {
      return;
    }
    sendCheckoutEvent({
      eventName: EVENT_NAMES.CHECKOUT.STEP_COMPLETED_BILLING_DETAILS,
      product: checkoutEventProduct,
      step: CHECKOUT_EVENT_STEPS.BILLING_DETAILS,
      order: {
        order_id: checkoutIntent.stripeCheckoutSessionId ?? undefined,
        total_quantity: checkoutIntent.quantity,
      },
    });
  }, [checkoutEventProduct, checkoutIntent]);

  // Try to keep the polled CheckoutIntent in sync with the BFF CheckoutIntent.
  useEffect(() => {
    if (polledCheckoutIntent?.state !== checkoutIntent?.state && !resyncSuccessBFFInProgress.current) {
      resyncSuccessBFFInProgress.current = true;
      // Invalidate the BFFSuccess query key for the specific admin user,
      // queuing it to be refetched imminently.
      const invalidatePromise = queryClient.invalidateQueries({
        queryKey: queryBffSuccess(authenticatedUser?.userId).queryKey,
      }).then(() => {
        // Actually force a refetch for instant feedback.
        refetchUseBFFSuccess().catch(() => { /* do nothing on error */ });
      });
      // Eagerly refresh the user's JWT token.
      // The self-service fulfillment backend modifies the user's enterprise roles, and
      // the user's browser needs that new role BEFORE we navigate to the admin-portal,
      // or else bad things happen on the admin-portal.
      const refetchJwtPromise = polledCheckoutIntent?.state === 'fulfilled'
        ? fetchAuthenticatedUser({ forceRefresh: true })
        : Promise.resolve();
      // Only when both tasks resolve, set the progress tracker back to false to allow
      // data to be updated again if needed.
      Promise.all([
        invalidatePromise,
        refetchJwtPromise,
      ]).finally(() => {
        resyncSuccessBFFInProgress.current = false;
      });
    }
  }, [
    authenticatedUser?.userId,
    checkoutIntent?.state,
    polledCheckoutIntent?.state,
    queryClient,
    refetchUseBFFSuccess,
  ]);

  return (
    <>
      <BillingDetailsHeadingMessage />
      <StatefulProvisioningButton />
      <Stack gap={4}>
        <SubscriptionStartMessage />
        <OrderDetails />
        <ContactSupport />
      </Stack>
    </>
  );
};

export default BillingDetailsSuccessContent;
