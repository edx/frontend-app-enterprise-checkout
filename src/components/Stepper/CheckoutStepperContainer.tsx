import { Col, Row, Stack, Stepper } from '@openedx/paragon';
import { ReactElement, useEffect } from 'react';

import { useRotatingTestimonial } from '@/components/app/data/hooks/useTestimonials';
import { PurchaseSummary } from '@/components/PurchaseSummary';
import TestimonialCard from '@/components/PurchaseSummary/TestimonialCard';
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
  const currentTestimonial = useRotatingTestimonial(currentStepKey ?? 'checkout-step');

  useEffect(() => {
    const preventUnload = (e: BeforeUnloadEvent) => {
      if (currentSubstepKey !== CheckoutSubstepKey.Success) {
        e.preventDefault();
      }
    };
    window.addEventListener('beforeunload', preventUnload);
    // Added safety to force remove the 'beforeunload' event on the global window
    return () => {
      window.removeEventListener('beforeunload', preventUnload);
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
            <TestimonialCard testimonial={currentTestimonial} />
          </Col>
        </Row>
      </Stack>
    </Stepper>
  );
};

export default CheckoutStepperContainer;
