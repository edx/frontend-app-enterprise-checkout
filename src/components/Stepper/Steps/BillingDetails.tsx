import { useIntl } from '@edx/frontend-platform/i18n';
import { Stack, Stepper } from '@openedx/paragon';
import { Helmet } from 'react-helmet';

import { useCheckoutSessionClientSecret } from '@/components/app/data';
import { BillingDetailsPage } from '@/components/billing-details-pages';
import { useStepperContent } from '@/components/Stepper/Steps/hooks';
import { StripeProvider } from '@/components/StripeProvider';
import { CheckoutPageDetails, CheckoutStepKey } from '@/constants/checkout';

const BillingDetails = () => {
  const checkoutSessionClientSecret = useCheckoutSessionClientSecret();
  const StepperContent = useStepperContent();
  const intl = useIntl();

  if (!checkoutSessionClientSecret) {
    const title = intl.formatMessage(CheckoutPageDetails.BillingDetails.title);
    return (
      <>
        <Helmet title={title} />
        <Stepper.Step eventKey={CheckoutStepKey.BillingDetails} title={title}>
          <Stack gap={4}>
            <StepperContent />
          </Stack>
        </Stepper.Step>
      </>

    );
  }
  return (
    <StripeProvider>
      <BillingDetailsPage />
    </StripeProvider>
  );
};

export default BillingDetails;
