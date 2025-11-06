import { getConfig } from '@edx/frontend-platform/config';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { Hyperlink } from '@openedx/paragon';

import { useCheckoutIntent } from '@/components/app/data';
import EVENT_NAMES from '@/constants/events';
import { sendEnterpriseCheckoutTrackingEvent } from '@/utils/common';

const ContactSupport = () => {
  const { CONTACT_SUPPORT_URL } = getConfig();
  const { data: checkoutIntent } = useCheckoutIntent();
  return (
    <div className="text-left w-50 mx-auto">
      <p className="text-muted mb-0">
        <FormattedMessage
          id="checkout.orderDetails.needHelp"
          defaultMessage="For questions about your subscription or our cancellation procedures, please {contactSupport}"
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
                showLaunchIcon={false}
              >
                <FormattedMessage
                  id="checkout.orderDetails.contactSupport"
                  defaultMessage="contact support"
                  description="Link text for contacting support"
                />
              </Hyperlink>
            ),
          }}
        />
      </p>
    </div>
  );
};

export default ContactSupport;
