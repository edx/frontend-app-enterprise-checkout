import { Stepper } from '@openedx/paragon';
import { Navigate, useParams } from 'react-router-dom';

import { CheckoutStepKey, CheckoutStepperPath } from '@/components/Stepper/constants';
import {
  AccountDetails, BillingDetails,
  PlanDetails,
} from '@/components/Stepper/Steps';

const Steps: React.FC = () => (
  <div className="py-4">
    <PlanDetails />
    <AccountDetails />
    <BillingDetails />
  </div>
);

const CheckoutStepper: React.FC = () => {
  const { step } = useParams<{ step: CheckoutStepKey }>();
  if (!step) {
    return <Navigate to={CheckoutStepperPath.PlanDetailsRoute} />;
  }
  return (
    <Stepper activeKey={step}>
      <Stepper.Header />
      <Steps />
    </Stepper>
  );
};

export default CheckoutStepper;
