import { Container } from '@openedx/paragon';

import { CheckoutStepperContainer } from '@/components/Stepper';

const CheckoutPage: React.FC = () => (
  <main>
    <Container size="lg" className="py-4.5">
      <CheckoutStepperContainer />
    </Container>
  </main>
);

export default CheckoutPage;
