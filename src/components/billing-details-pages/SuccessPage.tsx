import { FormattedMessage } from '@edx/frontend-platform/i18n';
import {
  Stack, Stepper,
} from '@openedx/paragon';
import { Helmet } from 'react-helmet';

import OrderDetails from '@/components/OrderDetails/OrderDetails';
import { CheckoutStepKey } from '@/components/Stepper/constants';
import SuccessHeading from '@/components/SuccessHeading/SuccessHeading';
import SuccessNotification from '@/components/SuccessNotification/SuccessNotification';

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
          <SuccessHeading />
          <Stack gap={4}>
            <SuccessNotification />
            <OrderDetails />
          </Stack>
        </Stepper.Step>
      </Stack>
    </>
  );
};

export default SuccessPage;
