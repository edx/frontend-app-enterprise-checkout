import { BillingDetailsPage } from '@/components/billing-details-pages';
import { StripeProvider } from '@/components/StripeProvider';

// TODO: unnecessary layer of abstraction, just move component logic into this file.
const BillingDetails = () => (
  <StripeProvider>
    <BillingDetailsPage />
  </StripeProvider>
);

export default BillingDetails;
