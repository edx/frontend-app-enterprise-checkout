import { Button } from '@openedx/paragon';
import { FormattedMessage } from 'react-intl';

import { useCheckoutIntent, useCreateBillingPortalSession } from '@/components/app/data';
import EVENT_NAMES from '@/constants/events';
import { sendEnterpriseCheckoutTrackingEvent } from '@/utils/common';

const ReceiptButton: React.FC = () => {
  // TODO: Add this endpoint to the success page loader
  const { data: billingPortalSession } = useCreateBillingPortalSession();
  const { data: checkoutIntent } = useCheckoutIntent();

  return (
    <Button
      className="w-100 text-primary-500"
      variant="outline-primary"
      disabled={!billingPortalSession?.url}
      href={billingPortalSession?.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => sendEnterpriseCheckoutTrackingEvent({
        checkoutIntentId: checkoutIntent?.id ?? null,
        eventName: EVENT_NAMES.SUBSCRIPTION_CHECKOUT.VIEW_RECEIPT_BUTTON_CLICKED,
        properties: {
          billingPortalSessionUrl: billingPortalSession?.url,
        },
      })}
    >
      <FormattedMessage
        id="components.PurchaseSummary.ReceiptButton.viewReceipt"
        defaultMessage="View receipt"
        description="Button text to view the receipt for the purchase"
      />
    </Button>
  );
};

export default ReceiptButton;
