import { Stepper } from '@openedx/paragon';
import { Navigate, useParams } from 'react-router-dom';

import PlanDetails from '@/components/PlanDetails';
import AccountDetails from '@/components/AccountDetails';

const Steps: React.FC = () => (
  <div className="py-4">
    <PlanDetails />
    <AccountDetails />
  </div>
);

const CheckoutStepper: React.FC = () => {
  const { step } = useParams<{ step: Step }>();
  if (!step) {
    return <Navigate to="plan" />;
  }
  return (
    <Stepper activeKey={step}>
      <Steps />
    </Stepper>
  );
};

export default CheckoutStepper;
