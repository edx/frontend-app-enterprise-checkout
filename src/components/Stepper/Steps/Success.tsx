import { steps } from '@/components/Stepper/constants';
import { Stepper } from '@openedx/paragon';

const Success = () => {
  const eventKey = steps[4];
  return (
    <Stepper.Step eventKey={eventKey} title="Success">
      Success
    </Stepper.Step>
  );
};

export default Success;
