import { FormattedMessage } from '@edx/frontend-platform/i18n';

import { FieldContainer } from '@/components/FieldContainer';

const OrderDetails = () => (
  <FieldContainer>
    <div>
      <h3>
        <FormattedMessage
          id="checkout.orderDetails.title"
          defaultMessage="Order Details"
          description="Title for the order fields section"
        />
      </h3>
      <h3 className="font-weight-light">
        <FormattedMessage
          id="checkout.orderDetails.description"
          defaultMessage="You have purchased an edX team's subscription."
          description="Description text explaining the order details purpose"
        />
      </h3>
    </div>
  </FieldContainer>
);

export default OrderDetails;
