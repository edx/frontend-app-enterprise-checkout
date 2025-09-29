import { Stack } from '@openedx/paragon';

import { OrderDetails } from '@/components/billing-details-pages/OrderDetails';
import { SubscriptionStartMessage } from '@/components/billing-details-pages/SubscriptionStartMessage';
import { SuccessHeading } from '@/components/billing-details-pages/SuccessHeading';

const BillingDetailsSuccessContent = () => (
  <>
    <SuccessHeading />
    <Stack gap={4}>
      <SubscriptionStartMessage />
      <OrderDetails />
    </Stack>
  </>
);

export default BillingDetailsSuccessContent;
