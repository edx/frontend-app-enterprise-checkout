import { FormattedMessage } from '@edx/frontend-platform/i18n';

const OrderDetailsHeading: React.FC = () => (
  <>
    <h2 className="mb-3">
      <FormattedMessage
        id="checkout.orderDetails.title"
        defaultMessage="Order details"
        description="Title for the order details section"
      />
    </h2>
    <p className="text-muted mb-4">
      <FormattedMessage
        id="checkout.orderDetails.description"
        defaultMessage="You have purchased an edX team's subscription."
        description="Description text explaining the order details"
      />
    </p>
  </>
);

export default OrderDetailsHeading;
