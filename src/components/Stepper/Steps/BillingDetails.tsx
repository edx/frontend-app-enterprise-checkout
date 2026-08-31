import { Stack, Stepper } from '@openedx/paragon';
import { Helmet } from 'react-helmet';

import { useCheckoutSessionClientSecret } from '@/components/app/data';
import { BillingDetailsPage } from '@/components/billing-details-pages';
import { useStepperContent } from '@/components/Stepper/Steps/hooks';
import { StripeProvider } from '@/components/StripeProvider';
import { CheckoutStepKey } from '@/constants/checkout';

const BillingDetails = () => {
  const checkoutSessionClientSecret = useCheckoutSessionClientSecret();
  const StepperContent = useStepperContent();

  if (!checkoutSessionClientSecret) {
    return (
      <>
        <Helmet title="Billing Details" />
        <Stepper.Step eventKey={CheckoutStepKey.BillingDetails} title="Billing Details">
          <Stack gap={4}>
            <StepperContent />
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
