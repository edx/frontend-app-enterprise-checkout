import { AppContext } from '@edx/frontend-platform/react';
import { Col, Row, Stack, Stepper } from '@openedx/paragon';
import { useContext, useMemo } from 'react';

import { useBFFSuccess } from '@/components/app/data';
import ErrorHeadingSimplified from '@/components/billing-details-pages/ErrorHeading/ErrorHeadingSimplified';
import { PurchaseSummary } from '@/components/PurchaseSummary';
import { StepperTitle } from '@/components/Stepper/StepperTitle';
import {
  AccountDetails,
  BillingDetails,
  PlanDetails,
} from '@/components/Stepper/Steps';
import useCurrentStep from '@/hooks/useCurrentStep';

const Steps: React.FC = () => (
  <>
    <PlanDetails />
    <AccountDetails />
    <BillingDetails />
  </>
);

const CheckoutStepperContainer: React.FC = () => {
  const { currentStepKey } = useCurrentStep();
  const { authenticatedUser }:AppContextValue = useContext(AppContext);

  const { data: successBFFContext } = useBFFSuccess(authenticatedUser?.id);
  const { checkoutIntent } = successBFFContext || {};

  const { displaySuccessBanner, displayErrorAlert } = useMemo(() => ({
    displaySuccessBanner: checkoutIntent?.state === 'paid' || checkoutIntent?.state === 'fulfilled',
    displayErrorAlert: checkoutIntent?.state === 'errored_provisioning' || checkoutIntent?.state === 'errored_stripe_checkout',
  }), [checkoutIntent?.state]);

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
            {displayErrorAlert && <ErrorHeadingSimplified />}
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
