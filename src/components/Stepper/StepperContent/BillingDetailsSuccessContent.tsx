import { AppContext } from '@edx/frontend-platform/react';
import { Stack } from '@openedx/paragon';
import { useContext, useMemo } from 'react';

import { useBFFSuccess } from '@/components/app/data';
import { ErrorHeading } from '@/components/billing-details-pages/ErrorHeading';
import { OrderDetails } from '@/components/billing-details-pages/OrderDetails';
import { SubscriptionStartMessage } from '@/components/billing-details-pages/SubscriptionStartMessage';
import { SuccessHeading } from '@/components/billing-details-pages/SuccessHeading';
import { StatefulProvisioningButton } from '@/components/StatefulButton';

const BillingDetailsSuccessContent = () => {
  const { authenticatedUser }:AppContextValue = useContext(AppContext);
  const { data: successBFFContext } = useBFFSuccess(authenticatedUser?.id);
  const { checkoutIntent } = successBFFContext || {};
  const { displaySuccessBanner, displayErrorAlert } = useMemo(() => ({
    displaySuccessBanner: checkoutIntent?.state === 'paid' || checkoutIntent?.state === 'fulfilled',
    displayErrorAlert: checkoutIntent?.state === 'errored_provisioning' || checkoutIntent?.state === 'errored_stripe_checkout',
  }), [checkoutIntent?.state]);

  return (
    <>
      {displayErrorAlert && <ErrorHeading />}
      {displaySuccessBanner && <SuccessHeading />}
      <StatefulProvisioningButton />
      <Stack gap={4}>
        <SubscriptionStartMessage />
        <OrderDetails />
      </Stack>
    </>
  );
};

export default BillingDetailsSuccessContent;
