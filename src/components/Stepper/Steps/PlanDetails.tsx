import { useParams } from 'react-router';

import LoginPage from '@/components/plan-details-pages/LoginPage';
import PlanDetailsPage from '@/components/plan-details-pages/PlanDetailsPage';
import RegistrationPage from '@/components/plan-details-pages/RegistrationPage';
import {
  CheckoutSubstepKey,
} from '@/constants/checkout';
import './css/PriceAlert.css';

const PlanDetails: React.FC = () => {
  const { substep } = useParams<{ substep: CheckoutSubstepKey }>();

  if (substep === CheckoutSubstepKey.Register) {
    return <RegistrationPage />;
  }

  if (substep === CheckoutSubstepKey.Login) {
    return <LoginPage />;
  }

  return <PlanDetailsPage />;
};

export default PlanDetails;
