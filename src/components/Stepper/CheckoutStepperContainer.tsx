import { Col, Row, Stack, Stepper } from '@openedx/paragon';
import { ReactElement, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { PurchaseSummary } from '@/components/PurchaseSummary';
import { StepperTitle } from '@/components/Stepper/StepperTitle';
import { AccountDetails, BillingDetails, PlanDetails } from '@/components/Stepper/Steps';
import { CheckoutStepKey, CheckoutSubstepKey } from '@/constants/checkout';
import useCurrentStep from '@/hooks/useCurrentStep';

import AcademicSelection from './Steps/AcademicSelection';

const Steps = (): ReactElement => (
  <>
    <AcademicSelection />
    <PlanDetails />
    <AccountDetails />
    <BillingDetails />
  </>
);

// Use ‘Academic selection’ as a fallback only when the value is null or undefined.
const CheckoutStepperContainer = (): ReactElement => {
  const { currentStepKey, currentSubstepKey } = useCurrentStep();
  const location = useLocation();

  const isEssentialsFlow = location.pathname.startsWith('/essentials');

  const activeStep = currentStepKey
    ?? (isEssentialsFlow
      ? CheckoutStepKey.AcademicSelection
      : CheckoutStepKey.AcademicSelection);

  useEffect(() => {
    const preventUnload = (e: BeforeUnloadEvent) => {
      if (currentSubstepKey !== CheckoutSubstepKey.Success) {
        e.preventDefault();
      }
    };
    window.addEventListener('beforeunload', preventUnload);
    return () => {
      window.removeEventListener('beforeunload', preventUnload);
    };
  }, [currentSubstepKey]);

  return (
    // when user entered in our dashbord so intial redering Academic selection.
    <Stepper activeKey={activeStep}>
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
