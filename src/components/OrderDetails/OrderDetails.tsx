import { FormattedMessage } from '@edx/frontend-platform/i18n';

import FieldWrapper from '@/components/FieldWrapper/FieldWrapper';

const OrderDetails = () => (
  <FieldWrapper>
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
  </FieldWrapper>
);

export default OrderDetails;
