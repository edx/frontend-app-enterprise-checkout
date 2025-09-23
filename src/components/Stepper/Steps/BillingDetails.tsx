import useCheckoutSessionClientSecret from '@/components/app/data/hooks/useCheckoutSessionClientSecret';
import { BillingDetailsPage } from '@/components/billing-details-pages';
import { StripeProvider } from '@/components/StripeProvider';

const BillingDetails = () => {
  // Approach #2: Create a new billing details Page with success.
  const checkoutSessionClientSecret = useCheckoutSessionClientSecret();
  // if (!checkoutSessionClientSecret) {
  //   return <Stepper.Step eventKey={CheckoutStepKey.BillingDetails} title="Billing Details">Loading...</Stepper.Step>;
  // }
  return (
    <StripeProvider>
      <BillingDetailsPage />
    </StripeProvider>
  );
};

export default BillingDetails;
