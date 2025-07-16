import {
  Col, Container, Row, Stack,
} from '@openedx/paragon';
import CheckoutStepper from '@/components/Stepper/CheckoutStepper';
import { SubscriptionSummary } from '@/components/SubscriptionSummary';

const CheckoutPage: React.FC = () => (
  <main>
    <Container size="lg" className="py-4.5">
      <Row>
        <Col xs={12} lg={8}>
          <CheckoutStepper />
        </Col>
        <Col lg={4}>
          <Stack gap={4}>
            <SubscriptionSummary />
          </Stack>
        </Col>
      </Row>
    </Container>
  </main>
);

export default CheckoutPage;
