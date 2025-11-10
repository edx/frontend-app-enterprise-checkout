import { AppContext } from '@edx/frontend-platform/react';
import { Stack } from '@openedx/paragon';
import { useContext, useEffect, useMemo } from 'react';

import { useBFFSuccess } from '@/components/app/data';
import { BillingDetailsHeadingMessage } from '@/components/billing-details-pages/BillingDetailsHeadingMessage';
import { ContactSupport } from '@/components/billing-details-pages/ContactSupport';
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
  const { data: successBFFContext, isLoading } = useBFFSuccess(authenticatedUser?.userId ?? null);
  const { checkoutIntent } = successBFFContext || {};
  const bannerElement = useMemo(
    () => determineBannerMessage(checkoutIntent?.state),
    [checkoutIntent?.state],
  );

  // Reload page when tab is brought back to foreground
  useEffect(() => {
    const onFocus = () => {
      // Only from Success page
      window.location.reload();
    };

    // Trigger on tab returning to foreground
    const onVisibility = () => {
      if (document.visibilityState === 'visible') { onFocus(); }
    };
    if (!authenticatedUser.isActive) {
      window.addEventListener('focus', onFocus);
      document.addEventListener('visibilitychange', onVisibility);
    }
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [authenticatedUser.isActive]);

  // TODO: Either display a skeleton state or add success endpoint to loader
  if (isLoading) {
    return null;
  }

  return (
    <>
      <BillingDetailsHeadingMessage>
        {bannerElement}
      </BillingDetailsHeadingMessage>
      <StatefulProvisioningButton />
      <Stack gap={4}>
        <SubscriptionStartMessage />
        <OrderDetails />
        <ContactSupport />
      </Stack>
    </>
  );
};

export default BillingDetailsSuccessContent;
