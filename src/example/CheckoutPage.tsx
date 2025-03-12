import {
  Col, Container, Row, Skeleton, Stack,
} from '@openedx/paragon';

import CheckoutProvider, { useFormStore } from './CheckoutProvider';
import CheckoutStepper from './CheckoutStepper';
import SubscriptionSummary from './SubscriptionSummary';

// NOTE: temporary
const CheckoutPreview: React.FC = () => {
  return (
    <div>
      <pre>
        {JSON.stringify(useFormStore(), null, 2)}
      </pre>
    </div>
  )
};

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
            {/* <CheckoutPreview /> */}
            {/* <div>
              <Skeleton height={360} />
            </div> */}
          </Stack>
        </Col>
      </Row>
    </Container>
  </main>
);

export default CheckoutPage;
