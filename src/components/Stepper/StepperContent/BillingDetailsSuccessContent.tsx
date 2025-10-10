import { AppContext } from '@edx/frontend-platform/react';
import { Stack } from '@openedx/paragon';
import { useContext, useMemo } from 'react';

import { useBFFSuccess } from '@/components/app/data';
import { BillingDetailsHeadingMessage } from '@/components/billing-details-pages/BillingDetailsHeadingMessage';
import { ErrorHeading } from '@/components/billing-details-pages/ErrorHeading';
import { OrderDetails } from '@/components/billing-details-pages/OrderDetails';
import { PendingHeading } from '@/components/billing-details-pages/PendingHeading';
import { SubscriptionStartMessage } from '@/components/billing-details-pages/SubscriptionStartMessage';
import { SuccessHeading } from '@/components/billing-details-pages/SuccessHeading';
import { StatefulProvisioningButton } from '@/components/StatefulButton';

const determineBannerMessage = (state?: string | null) => {
  if (!state) { return null; }
  if (state === 'paid') {
    return <PendingHeading />;
  }
  if (state === 'fulfilled') {
    return <SuccessHeading />;
  }
  if (['errored_provisioning', 'errored_stripe_checkout'].includes(state)) {
    return <ErrorHeading />;
  }
  return null;
};

const BillingDetailsSuccessContent = () => {
  const { authenticatedUser }:AppContextValue = useContext(AppContext);
  const { data: successBFFContext, refetch } = useBFFSuccess(authenticatedUser?.userId || null);
  const { checkoutIntent } = successBFFContext || {};
  const bannerElement = useMemo(
    () => determineBannerMessage(checkoutIntent?.state),
    [checkoutIntent?.state],
  );
  refetch().catch(error => error);
  return (
    <>
      <BillingDetailsHeadingMessage>
        {bannerElement}
      </BillingDetailsHeadingMessage>
      <StatefulProvisioningButton />
      <Stack gap={4}>
        <SubscriptionStartMessage />
        <OrderDetails />
      </Stack>
    </>
  );
};

export default BillingDetailsSuccessContent;
