import { defineMessages, FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import dayjs from 'dayjs';

import { useCheckoutIntent, useCreateBillingPortalSession, useFirstBillableInvoice } from '@/components/app/data';
import { LONG_MONTH_DATE_FORMAT } from '@/components/app/data/constants';
import { FieldContainer } from '@/components/FieldContainer';
import EVENT_NAMES from '@/constants/events';
import { sendEnterpriseCheckoutTrackingEvent } from '@/utils/common';

const freeTrialDateRangeText = (
  { startTime, endTime }: { startTime: FirstBillableInvoice['startTime'], endTime: FirstBillableInvoice['endTime'] },
) => `${dayjs(startTime).format(LONG_MONTH_DATE_FORMAT)} - ${dayjs(endTime).format(LONG_MONTH_DATE_FORMAT)}`;

const messages = defineMessages({
  subscriptionManagement: {
    id: 'checkout.freeTrialSubscriptionStartMessage.subscriptionManagement',
    defaultMessage: 'Subscription Management',
    description: 'Link text for the subscription management page',
  },
});

const SubscriptionStartMessage = () => {
  const intl = useIntl();
  const { data: firstBillableInvoice } = useFirstBillableInvoice();
  // TODO: Add this endpoint to the success page loader
  const { data: billingPortalSession } = useCreateBillingPortalSession();
  const { data: checkoutIntent } = useCheckoutIntent();
  const { startTime, endTime } = firstBillableInvoice ?? { startTime: null, endTime: null };

  if (!(startTime && endTime)) {
    return null;
  }

  return (
    <FieldContainer>
      <div>
        <h3>
          <FormattedMessage
            id="checkout.freeTrialSubscriptionStartMessage.title"
            defaultMessage="Your free trial for edX team's subscription has started."
            description="Title for the free trial success field section"
          />
        </h3>
        <p className="h4 font-weight-light">
          <FormattedMessage
            id="checkout.freeTrialSubscriptionStartMessage.description"
            defaultMessage="Your trial expires on {boldDate}. Cancel anytime from the {link} page."
            description="Description text explaining the subscription details"
            values={{
              boldDate: <span className="font-weight-bold">{dayjs(endTime).format(LONG_MONTH_DATE_FORMAT)}</span>,
              link: (
                <a
                  onClick={() => sendEnterpriseCheckoutTrackingEvent({
                    checkoutIntentId: checkoutIntent?.id ?? null,
                    eventName: EVENT_NAMES.SUBSCRIPTION_CHECKOUT.SUBSCRIPTION_MANAGEMENT_LINK_CLICKED,
                    properties: {
                      billingPortalSessionUrl: billingPortalSession?.url,
                    },
                  })}
                  href={billingPortalSession?.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {intl.formatMessage(messages.subscriptionManagement)}
                </a>
              ),
            }}
          />
        </p>
      </div>
      <div className="mt-3">
        <h4>
          <FormattedMessage
            id="checkout.freeTrialSubscriptionStartMessage.sub.title"
            defaultMessage="Your subscription plan"
            description="Sub title for the free trial success field section"
          />
        </h4>
        <p className="h4 font-weight-light">
          {freeTrialDateRangeText({ startTime, endTime })}
        </p>
      </div>
    </FieldContainer>
  );
};

export default SubscriptionStartMessage;
