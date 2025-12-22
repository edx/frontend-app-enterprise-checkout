import { FormattedMessage } from '@edx/frontend-platform/i18n';
import dayjs from 'dayjs';

import { usePurchaseSummaryPricing } from '@/components/app/data';
import { SHORT_MONTH_DATE_FORMAT, SUBSCRIPTION_TRIAL_LENGTH_DAYS } from '@/components/app/data/constants';
import { DisplayPrice } from '@/components/DisplayPrice';

const BillingDetailsDisclaimer = () => {
  const { yearlySubscriptionCostForQuantity } = usePurchaseSummaryPricing();
  const trialEndDate = dayjs().add(SUBSCRIPTION_TRIAL_LENGTH_DAYS, 'days').format(SHORT_MONTH_DATE_FORMAT);
  return (
    <p className="small font-weight-light">
      <FormattedMessage
        id="checkout.billingDetails.disclaimer.beforeBreak"
        defaultMessage="By signing up for a subscription or starting a {trialDays}-day free trial, you authorize us to
        charge your card on file {price}/year USD. Your subscription will automatically renew each year until you cancel.
        The price for your subscription may change. Cancel anytime by visiting the Subscription Management page.
        Refunds and credits are not available. You must cancel your subscription before the subscription renewal
        date in order to avoid charges for the next billing cycle. Cancelling a subscription stops the annual
        recurring subscription charge, but does not refund the transaction for the current billing period.
        You can continue to access the subscription until the end of the then-current billing period"
        description="Billing details disclaimer text before the line break in the billing details page"
        values={{
          trialDays: SUBSCRIPTION_TRIAL_LENGTH_DAYS,
          price: (<DisplayPrice value={yearlySubscriptionCostForQuantity ?? 0} />),
        }}
      />
      <br /><br />
      <span className="font-weight-bold">
        <FormattedMessage
          id="checkout.billingDetails.disclaimer.afterBreak"
          defaultMessage="After your {trialDays}-day free trial ends, your subscription will automatically renew each
        year at {price} USD per year until you cancel your subscription."
          description="Billing details disclaimer text after the line break in the billing details page"
          values={{
            trialDays: SUBSCRIPTION_TRIAL_LENGTH_DAYS,
            price: (<DisplayPrice value={yearlySubscriptionCostForQuantity ?? 0} />),
            trialEndDate,
          }}
        />
      </span>
    </p>
  );
};

export default BillingDetailsDisclaimer;
