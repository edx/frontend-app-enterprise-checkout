import { getConfig } from '@edx/frontend-platform/config';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { Hyperlink } from '@openedx/paragon';

import { useCheckoutIntent, useFirstBillableInvoice } from '@/components/app/data';
import { FieldContainer } from '@/components/FieldContainer';
import { DataStoreKey } from '@/constants/checkout';
import EVENT_NAMES from '@/constants/events';
import { useCheckoutFormStore } from '@/hooks/index';
import { sendEnterpriseCheckoutTrackingEvent } from '@/utils/common';

import OrderDetailsBillingInfo from './OrderDetailsBillingInfo';
import OrderDetailsHeading from './OrderDetailsHeading';

const OrderDetails = () => {
  const { CONTACT_SUPPORT_URL } = getConfig();
  const { data: checkoutIntent } = useCheckoutIntent();
  const { data: firstBillableInvoice } = useFirstBillableInvoice();
  const planDetailsData = useCheckoutFormStore((state) => state.formData[DataStoreKey.PlanDetails]);

  const { adminEmail = '' } = planDetailsData ?? {};
  const {
    billingAddress = null,
    customerPhone = '',
    last4 = 0,
    cardBrand = 'card',
  } = firstBillableInvoice ?? {};

  const phoneNumber = customerPhone;
  const cardLast4 = last4.toString();
  const cardBrandDisplay = cardBrand.charAt(0).toUpperCase() + cardBrand.slice(1);

  return (
    <>
      <FieldContainer>
        <div>
          <OrderDetailsHeading />

          <OrderDetailsBillingInfo
            adminEmail={adminEmail}
            cardBrand={cardBrandDisplay}
            cardLast4={cardLast4}
            phoneNumber={phoneNumber}
            billingAddress={billingAddress}
          />
        </div>
      </FieldContainer>

      <div className="text-center mt-4">
        <p className="text-muted mb-0">
          <FormattedMessage
            id="checkout.orderDetails.needHelp"
            defaultMessage="Need help? {contactSupport}"
            description="Help text with link to contact support"
            values={{
              contactSupport: (
                <Hyperlink
                  destination={CONTACT_SUPPORT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => sendEnterpriseCheckoutTrackingEvent({
                    checkoutIntentId: checkoutIntent?.id ?? null,
                    eventName: EVENT_NAMES.SUBSCRIPTION_CHECKOUT.CONTACT_SUPPORT_LINK_CLICKED,
                  })}
                >
                  <FormattedMessage
                    id="checkout.orderDetails.contactSupport"
                    defaultMessage="Contact support"
                    description="Link text for contacting support"
                  />
                </Hyperlink>
              ),
            }}
          />
        </p>
      </div>
    </>
  );
};

export default OrderDetails;
