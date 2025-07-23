import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { Stack, Stepper } from '@openedx/paragon';
import { Helmet } from 'react-helmet';

import DataPrivacyPolicyField from '@/components/FormFields/DataPrivacyPolicyField';
import OrderDetails from '@/components/OrderDetails/OrderDetails';
import { CheckoutStepKey } from '@/components/Stepper/constants';

const SuccessPage: React.FC = () => {
  const eventKey = CheckoutStepKey.BillingDetails;
  return (
    <>
      <Helmet title="Billing Details" />
      <Stack gap={4}>
        <Stepper.Step eventKey={eventKey} title="Billing Details">
          <h1 className="mb-5 text-center">
            <FormattedMessage
              id="checkout.accountDetails.title"
              defaultMessage="Thank you, {firstName}."
              description="Title for the account details step"
              values={{ firstName: 'Don' }}
            />
          </h1>
          <Stack gap={4}>
            <DataPrivacyPolicyField />
            <OrderDetails />
          </Stack>
        </Stepper.Step>
      </Stack>
    </>
  );
};

export default SuccessPage;
