import { Stepper } from '@openedx/paragon';

import useCheckoutSessionClientSecret from '@/components/app/data/hooks/useCheckoutSessionClientSecret';
import { BillingDetailsPage } from '@/components/billing-details-pages';
import { StripeProvider } from '@/components/StripeProvider';
import { CheckoutStepKey } from '@/constants/checkout';

const BillingDetails = () => {
  const checkoutSessionClientSecret = useCheckoutSessionClientSecret();
  if (!checkoutSessionClientSecret) {
    return <Stepper.Step eventKey={CheckoutStepKey.BillingDetails} title="Billing Details">Loading...</Stepper.Step>;
  }
  return (
    <StripeProvider>
      <BillingDetailsPage />
    </StripeProvider>
  );
};

export default BillingDetails;
