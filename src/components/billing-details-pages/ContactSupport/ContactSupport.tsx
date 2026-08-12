import { getConfig } from '@edx/frontend-platform/config';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import { useCheckoutIntent } from '@/components/app/data';
import { ExternalLink } from '@/components/ExternalLink';
import EVENT_NAMES from '@/constants/events';
import { sendEnterpriseCheckoutTrackingEvent } from '@/utils/common';

const ContactSupport = () => {
  const { CONTACT_SUPPORT_URL } = getConfig();
  const { data: checkoutIntent } = useCheckoutIntent();
  return (
    <div className="text-left w-75 mx-auto">
      <p className="text-muted mb-0">
        <FormattedMessage
          id="checkout.orderDetails.needHelp"
          defaultMessage="For questions about your subscription or our{lineBreak}cancellation procedures, please {contactSupport}"
          description="Help text with link to contact support"
          values={{
            lineBreak: <br />,
            contactSupport: (
              <ExternalLink
                href={CONTACT_SUPPORT_URL}
                onClick={() => sendEnterpriseCheckoutTrackingEvent({
                  checkoutIntentId: checkoutIntent?.id ?? null,
                  checkoutIntentUuid: checkoutIntent?.uuid ?? null,
                  eventName: EVENT_NAMES.SUBSCRIPTION_CHECKOUT.CONTACT_SUPPORT_LINK_CLICKED,
                })}
              >
                <FormattedMessage
                  id="checkout.orderDetails.contactSupport"
                  defaultMessage="contact support"
                  description="Link text for contacting support"
                />
              </ExternalLink>
            ),
          }}
        />
      </p>
    </div>
  );
};

export default ContactSupport;
