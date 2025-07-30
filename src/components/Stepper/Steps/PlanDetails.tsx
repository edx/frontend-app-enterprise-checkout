import './css/PriceAlert.css';
import { useParams } from 'react-router';

import { PlanDetailsPage } from '@/components/plan-details-pages';
import { CheckoutSubstepKey } from '@/constants/checkout';

const PlanDetails: React.FC = () => {
  const { substep } = useParams<{ substep: CheckoutSubstepKey }>();

  // if (substep === CheckoutSubstepKey.Register) {
  //   return <RegistrationPage />;
  // }
  //
  // if (substep === CheckoutSubstepKey.Login) {
  //   return <LoginPage />;
  // }

  return <PlanDetailsPage />;
};

export default PlanDetails;
