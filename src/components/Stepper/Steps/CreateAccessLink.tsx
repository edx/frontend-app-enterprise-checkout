import { Stepper } from '@openedx/paragon';

import { CheckoutStep } from '@/components/Stepper/constants';

const CreateAccessLink = () => {
  const eventKey = CheckoutStep.CreateAccessLink;
  return (
    <Stepper.Step eventKey={eventKey} title="Create Access Link">
      Create Access Link
    </Stepper.Step>
  );
};

export default CreateAccessLink;
