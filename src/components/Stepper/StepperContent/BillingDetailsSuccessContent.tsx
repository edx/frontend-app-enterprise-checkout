import { Stack } from '@openedx/paragon';

import useCheckoutIntent from '@/components/app/data/hooks/useCheckoutIntent';
import { AccountProvisioningError } from '@/components/billing-details-pages/AccountProvisioningError';
import { OrderDetails } from '@/components/billing-details-pages/OrderDetails';
import { SuccessHeading } from '@/components/billing-details-pages/SuccessHeading';
import { SuccessNotification } from '@/components/billing-details-pages/SuccessNotification';

const BillingDetailsSuccessContent = () => {
  const { data: checkoutIntent } = useCheckoutIntent();
  const hasProvisioningError = checkoutIntent?.state === 'errored_provisioning';

  return (
    <>
      {!hasProvisioningError ? (
          <AccountProvisioningError />
        ) : (
        <SuccessHeading />
      )}
      <Stack gap={4}>
        <SuccessNotification />
        <OrderDetails />
      </Stack>
    </>
  );
};

export default BillingDetailsSuccessContent;
