import { Col, Row, Stack, Stepper } from '@openedx/paragon';

import { StepperTitle } from '@/components/Stepper/StepperTitle';
import {
  AccountDetails,
  BillingDetails,
  PlanDetails,
} from '@/components/Stepper/Steps';
import { SubscriptionSummary } from '@/components/SubscriptionSummary';
import useCurrentStep from '@/hooks/useCurrentStep';

const Steps: React.FC = () => (
  <>
    <PlanDetails />
    <AccountDetails />
    <BillingDetails />
  </>
);

const CheckoutStepper: React.FC = () => {
  const { currentStepKey } = useCurrentStep();

  return (
    <Stepper activeKey={currentStepKey}>
      <Stack gap={3}>
        <Row>
          <Col md={12} lg={8}>
            <Stepper.Header />
          </Col>
        </Row>
        <Row>
          <Col md={12} lg={8}>
            <StepperTitle />
          </Col>
          <Col md={12} lg={8}>
            <Steps />
          </Col>
          <Col md={12} lg={4}>
            <SubscriptionSummary />
          </Col>
        </Row>
      </Stack>
    </Stepper>
  );
};

export default CheckoutStepper;
