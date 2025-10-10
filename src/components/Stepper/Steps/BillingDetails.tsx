import { AppContext } from '@edx/frontend-platform/react';
import { Stack, Stepper } from '@openedx/paragon';
import { useContext } from 'react';
import { Helmet } from 'react-helmet';

import { useBFFSuccess, useCheckoutSessionClientSecret } from '@/components/app/data';
import { BillingDetailsPage } from '@/components/billing-details-pages';
import { BillingDetailsSuccessContent } from '@/components/Stepper/StepperContent';
import { StripeProvider } from '@/components/StripeProvider';
import { CheckoutStepKey } from '@/constants/checkout';
import { useCheckoutFormStore } from '@/hooks/useCheckoutFormStore';

const BillingDetails = () => {
  const { authenticatedUser }: AppContextValue = useContext(AppContext);
  const checkoutSessionClientSecret = useCheckoutSessionClientSecret();
  const { data: successContext } = useBFFSuccess(authenticatedUser.userId || null);
  const state = useCheckoutFormStore(s => s.checkoutSessionStatus);
  const successfulCheckout = state.type === 'complete' && state.paymentStatus === 'paid';
  console.log({
    successfulCheckout, successContext, checkoutSessionClientSecret, state,
  });
  if ((successfulCheckout && successContext?.checkoutIntent?.existingSuccessfulCheckoutIntent) || !checkoutSessionClientSecret) {
    return (
      <>
        <Helmet title="Billing Details" />
        <Stepper.Step eventKey={CheckoutStepKey.BillingDetails} title="Billing Details">
          <Stack gap={4}>
            <BillingDetailsSuccessContent />
          </Stack>
        </Stepper.Step>
      </>
    );
  }
  return (
    <StripeProvider>
      <BillingDetailsPage />
    </StripeProvider>
  );
};

export default BillingDetails;
