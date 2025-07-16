import { steps } from '@/components/Stepper/constants';
import { Stepper } from '@openedx/paragon';

const StartTrial = () => {
  const eventKey = steps[3];
  return (
    <Stepper.Step eventKey={eventKey} title="Create Trial">
      Start Trial
    </Stepper.Step>
  );
};

export default StartTrial;
