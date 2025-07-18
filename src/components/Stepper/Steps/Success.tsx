import { Stepper } from '@openedx/paragon';

import { CheckoutStep } from '@/components/Stepper/constants';

const Success = () => {
  const eventKey = CheckoutStep.Success;
  return (
    <Stepper.Step eventKey={eventKey} title="Success">
      Success
    </Stepper.Step>
  );
};

export default Success;
