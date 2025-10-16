import { FormattedMessage } from '@edx/frontend-platform/i18n';

const OrderDetailsHeading: React.FC = () => (
  <>
    <h3 className="mb-2">
      <FormattedMessage
        id="checkout.orderDetails.title"
        defaultMessage="Order details"
        description="Title for the order details section"
      />
    </h3>
    <h4 className="text-muted mb-3 font-weight-light">
      <FormattedMessage
        id="checkout.orderDetails.description"
        defaultMessage="You have purchased an edX team's subscription."
        description="Description text explaining the order details"
      />
    </h4>
  </>
);

export default OrderDetailsHeading;
