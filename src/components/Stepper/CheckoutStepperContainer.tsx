import { getConfig } from '@edx/frontend-platform/config';
import { Col, Row, Stack, Stepper } from '@openedx/paragon';
import { ReactElement, useEffect } from 'react';

import { PurchaseSummary } from '@/components/PurchaseSummary';
import { StepperTitle } from '@/components/Stepper/StepperTitle';
import { AccountDetails, BillingDetails, EssentialsAcademicSelection, PlanDetails } from '@/components/Stepper/Steps';
import { CheckoutSubstepKey } from '@/constants/checkout';
import useCurrentStep from '@/hooks/useCurrentStep';
import { isFeatureEnabled } from '@/utils/common';

const Steps = (): ReactElement => {
  const {
    FEATURE_SELF_SERVICE_ESSENTIALS,
    FEATURE_SELF_SERVICE_ESSENTIALS_KEY,
  } = getConfig();
  console.log(isFeatureEnabled(FEATURE_SELF_SERVICE_ESSENTIALS, FEATURE_SELF_SERVICE_ESSENTIALS_KEY));
  return (
    <>
      {
        isFeatureEnabled(
          FEATURE_SELF_SERVICE_ESSENTIALS,
          FEATURE_SELF_SERVICE_ESSENTIALS_KEY,
        ) && <EssentialsAcademicSelection />
      }
      <PlanDetails />
      <AccountDetails />
      <BillingDetails />
    </>
  );
};

const CheckoutStepperContainer = (): ReactElement => {
  const { currentStepKey, currentSubstepKey } = useCurrentStep();
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
          </Col>
        </Row>
      </Stack>
    </Stepper>
  );
};

export default CheckoutStepperContainer;
