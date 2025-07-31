import { Stack } from '@openedx/paragon';

import { OrderDetails } from '@/components/OrderDetails';
import { SuccessHeading } from '@/components/SuccessHeading';
import { SuccessNotification } from '@/components/SuccessNotification';

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
