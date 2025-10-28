import { defineMessages, FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import dayjs from 'dayjs';

import {
  useCheckoutIntent,
  useCreateBillingPortalSession,
  useFirstBillableInvoice,
  usePurchaseSummaryPricing,
} from '@/components/app/data';
import { LONG_MONTH_DATE_FORMAT, SUBSCRIPTION_TRIAL_LENGTH_DAYS } from '@/components/app/data/constants';
import { DisplayPrice } from '@/components/DisplayPrice';
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
  const { data: firstBillableInvoice, isLoading } = useFirstBillableInvoice();
  // TODO: Add this endpoint to the success page loader
  const { data: billingPortalSession } = useCreateBillingPortalSession();
  const { data: checkoutIntent } = useCheckoutIntent();
  const { yearlySubscriptionCostForQuantity } = usePurchaseSummaryPricing();

  if (isLoading || !firstBillableInvoice) {
    return null;
  }

  const {
    startTime = null,
    endTime = null,
    hasStartAndEndTime = false,
  } = firstBillableInvoice;

  if (!hasStartAndEndTime) {
    return null;
  }

  return (
    <FieldContainer>
      <div>
        <h3>
          <FormattedMessage
            id="checkout.freeTrialSubscriptionStartMessage.title"
            defaultMessage="Your free {trialDays}-day trial for edX Team's subscription has started."
            description="Title for the free trial success field section"
            values={{
              trialDays: SUBSCRIPTION_TRIAL_LENGTH_DAYS,
            }}
          />
        </h3>
        <p className="fs-4 font-weight-light">
          <FormattedMessage
            id="checkout.freeTrialSubscriptionStartMessage.description"
            defaultMessage="Your trial expires on {boldDate}. When your free trial ends, your subscription will
            begin, and we will charge your payment method on file {price} USD per year. To avoid being charged,
            you must cancel before your trial expires. This subscription will automatically renew every year unless
            you cancel from the {link} page."
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
              price: (<DisplayPrice value={yearlySubscriptionCostForQuantity ?? 0} />),
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
        <p className="fs-4 font-weight-light">
          {freeTrialDateRangeText({ startTime: startTime!, endTime: endTime! })}
        </p>
      </div>
    </FieldContainer>
  );
};

export default SubscriptionStartMessage;
