import { Stepper } from '@openedx/paragon';
import { steps } from '@/components/Stepper/constants';

const CreateAccessLink = () => {
  const eventKey = steps[2];
  return (
    <Stepper.Step eventKey={eventKey} title="Create Access Link">
      Create Access Link
    </Stepper.Step>
  );
};

export default CreateAccessLink;
