import { Button, Icon } from '@openedx/paragon';
import { Launch } from '@openedx/paragon/icons';
import { FormattedMessage } from 'react-intl';

import { useCheckoutIntent, useCreateBillingPortalSession } from '@/components/app/data';
import EVENT_NAMES from '@/constants/events';
import { sendEnterpriseCheckoutTrackingEvent } from '@/utils/common';

const ReceiptButton: React.FC = () => {
  const { data: billingPortalSession } = useCreateBillingPortalSession();
  const { data: checkoutIntent } = useCheckoutIntent();

  return (
    <Button
      className="w-100 text-primary-500 font-weight-bold"
      variant="outline-primary"
      disabled={!billingPortalSession?.url}
      href={billingPortalSession?.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => sendEnterpriseCheckoutTrackingEvent({
        checkoutIntentId: checkoutIntent?.id ?? null,
        checkoutIntentUuid: checkoutIntent?.uuid ?? null,
        eventName: EVENT_NAMES.SUBSCRIPTION_CHECKOUT.VIEW_RECEIPT_BUTTON_CLICKED,
        properties: {
          billingPortalSessionUrl: billingPortalSession?.url,
        },
      })}
    >
      <FormattedMessage
        id="components.PurchaseSummary.ReceiptButton.viewReceipt"
        defaultMessage="View Receipt"
        description="Button text to view the receipt for the purchase"
      />
      <Icon src={Launch as React.ComponentType<{}>} className="ml-1 small align-middle" />
    </Button>
  );
};

export default ReceiptButton;
