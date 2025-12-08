import { Col, Row, Stack, Stepper } from '@openedx/paragon';
import { ReactElement, useEffect } from 'react';

import { PurchaseSummary } from '@/components/PurchaseSummary';
import { StepperTitle } from '@/components/Stepper/StepperTitle';
import { AccountDetails, BillingDetails, PlanDetails } from '@/components/Stepper/Steps';
import { CheckoutSubstepKey } from '@/constants/checkout';
import useCurrentStep from '@/hooks/useCurrentStep';

const Steps = (): ReactElement => (
  <>
    <PlanDetails />
    <AccountDetails />
    <BillingDetails />
  </>
);

const CheckoutStepperContainer = (): ReactElement => {
  const { currentStepKey, currentSubstepKey } = useCurrentStep();

  useEffect(() => {
    const preventUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'Are you sure? Your data will not be saved.';
    };
    if (currentSubstepKey !== CheckoutSubstepKey.Success) {
      global.addEventListener('beforeunload', preventUnload);
    }
    // Added safety to force remove the 'beforeunload' event on the global window
    return () => {
      global.removeEventListener('beforeunload', preventUnload);
    };
  }, [currentSubstepKey]);

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
            <PurchaseSummary />
          </Col>
        </Row>
      </Stack>
    </Stepper>
  );
};

export default CheckoutStepperContainer;
