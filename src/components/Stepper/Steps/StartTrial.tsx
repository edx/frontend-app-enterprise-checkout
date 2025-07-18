import { Stepper } from '@openedx/paragon';

import { CheckoutStep } from '@/components/Stepper/constants';

const StartTrial = () => {
  const eventKey = CheckoutStep.StartTrial;
  return (
    <Stepper.Step eventKey={eventKey} title="Start Trial">
      Start Trial
    </Stepper.Step>
  );
};

export default StartTrial;
