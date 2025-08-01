import { Stepper } from '@openedx/paragon';

import {
  AccountDetails,
  BillingDetails,
  PlanDetails,
} from '@/components/Stepper/Steps';
import useCurrentStep from '@/hooks/useCurrentStep';

const Steps: React.FC = () => (
  <div className="py-4">
    <PlanDetails />
    <AccountDetails />
    <BillingDetails />
  </div>
);

const CheckoutStepper: React.FC = () => {
  const { currentStepKey } = useCurrentStep();
  return (
    <Stepper activeKey={currentStepKey}>
      <Stepper.Header />
      <Steps />
    </Stepper>
  );
};

export default CheckoutStepper;
