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
    <p className="fs-4 text-muted mb-3 font-weight-light">
      <FormattedMessage
        id="checkout.orderDetails.description"
        defaultMessage="You have purchased an edX team's subscription."
        description="Description text explaining the order details"
      />
    </p>
  </>
);

export default OrderDetailsHeading;
