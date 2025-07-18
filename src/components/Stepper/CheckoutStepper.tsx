import { Stepper } from '@openedx/paragon';
import { Navigate, useParams } from 'react-router-dom';

import { CheckoutStep } from '@/components/Stepper/constants';
import {
  BuildTrial,
  CreateAccount,
  CreateAccessLink,
  StartTrial,
} from '@/components/Stepper/Steps';

const Steps: React.FC = () => (
  <div className="py-4">
    <BuildTrial />
    <CreateAccount />
    <CreateAccessLink />
    <StartTrial />
  </div>
);

const CheckoutStepper: React.FC = () => {
  const { step } = useParams<{ step: Step }>();
  if (!step) {
    return <Navigate to={CheckoutStep.BuildTrial} />;
  }
  return (
    <Stepper activeKey={step}>
      <Stepper.Header />
      <Steps />
    </Stepper>
  );
};

export default CheckoutStepper;
