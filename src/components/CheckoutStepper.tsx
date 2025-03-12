import { Container, Stepper } from '@openedx/paragon';

import PlanDetails from '@/components/PlanDetails';
import OrganizationDetails from '@/components/OrganizationDetails';
import BillingDetails from '@/components/BillingDetails';
import { useCheckoutFormStore } from '@/hooks';

const CheckoutStepper: React.FC = () => {
  const { currentStep } = useCheckoutFormStore();
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
