import { BillingDetailsPage } from '@/components/billing-details-pages';
import { StripeProvider } from '@/components/StripeProvider';

const BillingDetails = () => (
  <StripeProvider>
    <BillingDetailsPage />
  </StripeProvider>
);

export default BillingDetails;
