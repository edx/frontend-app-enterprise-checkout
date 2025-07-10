import {
  Col, Container, Row, Stack,
} from '@openedx/paragon';

import CheckoutStepper from '@/components/CheckoutStepper';
import SubscriptionSummary from '@/components/SubscriptionSummary';

const CheckoutPage: React.FC = () => (
  <main>
    <Container size="lg" className="py-4.5">
      <Row>
        <Col xs={12} lg={8}>
          <CheckoutStepper />
        </Col>
        <Col>
          <Stack gap={4}>
            <SubscriptionSummary />
          </Stack>
        </Col>
      </Row>
    </Container>
  </main>
);

export default CheckoutPage;
