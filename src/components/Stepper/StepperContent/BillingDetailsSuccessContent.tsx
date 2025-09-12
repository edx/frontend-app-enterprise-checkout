import { Stack } from '@openedx/paragon';

import { OrderDetails } from '@/components/billing-details-pages/OrderDetails';
import { SuccessHeading } from '@/components/billing-details-pages/SuccessHeading';
import { SuccessNotification } from '@/components/billing-details-pages/SuccessNotification';

const BillingDetailsSuccessContent = () => (
  <>
    <SuccessHeading />
    <Stack gap={4}>
      <SuccessNotification />
      <OrderDetails />
    </Stack>
  </>
);

export default BillingDetailsSuccessContent;
