import { FormattedMessage } from '@edx/frontend-platform/i18n';
import dayjs from 'dayjs';

import { useFirstBillableInvoice } from '@/components/app/data';
import { FieldContainer } from '@/components/FieldContainer';

const freeTrialDateRangeText = (
  { startTime, endTime }: { startTime: firstBillableInvoice['startTime'], endTime: firstBillableInvoice['endTime'] },
) => `${dayjs(startTime).format('MMMM D, YYYY')} - ${dayjs(endTime).format('MMMM D, YYYY')}`;

const SubscriptionStartMessage = () => {
  const { data: firstBillableInvoice } = useFirstBillableInvoice();
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
        <h3 className="font-weight-light">
          <FormattedMessage
            id="checkout.freeTrialSubscriptionStartMessage.description"
            defaultMessage="Your trial expires on {boldDate}. Cancel anytime from the {link} page."
            description="Description text explaining the subscription details"
            values={{
              boldDate: <span className="font-weight-bold">{dayjs(endTime).format('MMMM D, YYYY')}</span>,
              link: (
                // TODO: Add URL to Subs Management Page
                <a href="https://google.com" target="_blank" rel="noopener noreferrer">
                  Subscription Management
                </a>
              ),
            }}
          />
        </h3>
      </div>
      <div className="mt-3">
        <h4>
          <FormattedMessage
            id="checkout.freeTrialSubscriptionStartMessage.sub.title"
            defaultMessage="Your subscription plan"
            description="Sub title for the free trial success field section"
          />
        </h4>
        <h4 className="font-weight-light">
          {freeTrialDateRangeText({ startTime, endTime })}
        </h4>
      </div>
    </FieldContainer>
  );
};

export default SubscriptionStartMessage;
