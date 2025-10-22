import { useFirstBillableInvoice } from '@/components/app/data';
import { FieldContainer } from '@/components/FieldContainer';

import OrderDetailsBillingInfo from './OrderDetailsBillingInfo';
import OrderDetailsHeading from './OrderDetailsHeading';

const OrderDetails = () => {
  const { data: firstBillableInvoice, isLoading } = useFirstBillableInvoice();

  if (isLoading || !firstBillableInvoice) {
    return null;
  }

  const { hasBillingAddress, hasCardDetails } = firstBillableInvoice;

  if (!(hasBillingAddress || hasCardDetails)) {
    return null;
  }

  return (
    <FieldContainer>
      <div>
        <OrderDetailsHeading />
        <OrderDetailsBillingInfo />
      </div>
    </FieldContainer>
  );
};

export default OrderDetails;
