import { useParams } from 'react-router';

import BillingDetailsPage from '@/components/billing-details-pages/BillingDetailsPage';
import SuccessPage from '@/components/billing-details-pages/SuccessPage';
import { CheckoutSubstepKey } from '@/components/Stepper/constants';

const BillingDetails = () => {
  const { substep } = useParams<{ substep: CheckoutSubstepKey }>();

  if (substep === CheckoutSubstepKey.Success) {
    return <SuccessPage />;
  }

  return <BillingDetailsPage />;
};

export default BillingDetails;
