import { Stepper } from '@openedx/paragon';

import { CheckoutStepKey } from '@/components/Stepper/constants';

const BillingDetails = () => {
  const eventKey = CheckoutStepKey.BillingDetails;
  return (
    <Stepper.Step eventKey={eventKey} title="Create Access Link">
      Create Access Link
    </Stepper.Step>
  );
};

export default BillingDetails;
