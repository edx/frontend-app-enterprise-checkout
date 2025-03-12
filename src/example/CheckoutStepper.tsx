import { Container, Stepper } from '@openedx/paragon';

import { useFormStore } from './CheckoutProvider';
import PlanDetails from './PlanDetails';
import OrganizationDetails from './OrganizationDetails';
import BillingDetails from './BillingDetails';

const CheckoutStepper: React.FC = () => {
  const { currentStep } = useFormStore();
  return (
    <Stepper activeKey={currentStep}>
      <Stepper.Header />
      <Container size="lg" className="py-4.5">
        <PlanDetails />
        <OrganizationDetails />
        <BillingDetails />
      </Container>
    </Stepper>
  );
};

export default CheckoutStepper;
