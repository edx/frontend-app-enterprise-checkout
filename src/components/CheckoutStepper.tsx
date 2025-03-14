import { Container, Stepper } from '@openedx/paragon';

import PlanDetails from '@/components/PlanDetails';
import AccountDetails from '@/components/AccountDetails';
import { useCheckoutFormStore } from '@/hooks';

const CheckoutStepper: React.FC = () => {
  const { currentStep } = useCheckoutFormStore();
  return (
    <Stepper activeKey={currentStep}>
      <Stepper.Header />
      <Container size="lg" className="py-4.5">
        <PlanDetails />
        <AccountDetails />
      </Container>
    </Stepper>
  );
};

export default CheckoutStepper;
