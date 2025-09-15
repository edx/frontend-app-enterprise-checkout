import { FormattedMessage } from '@edx/frontend-platform/i18n';
import dayjs from 'dayjs';

import { usePurchaseSummaryPricing } from '@/components/app/data';
import { DATE_FORMAT, SUBSCRIPTION_TRIAL_LENGTH_DAYS } from '@/components/app/data/constants';
import { DisplayPrice } from '@/components/DisplayPrice';

const BillingDetailsDisclaimer = () => {
  const { yearlySubscriptionCostForQuantity } = usePurchaseSummaryPricing();
  const trialEndDate = dayjs().add(SUBSCRIPTION_TRIAL_LENGTH_DAYS, 'days').format(DATE_FORMAT);
  return (
    <p className="font-weight-light">
      <FormattedMessage
        id="checkout.billingDetails.disclaimer.beforeBreak"
        defaultMessage="By signing up for a subscription or starting a {trialDays}-day free trial, you authorize us to charge your card on file {price}/year USD. Your subscription will automatically renew each year until you cancel. Cancel anytime by visiting the Subscription Management page. Refunds and credits are not available. Cancelling a subscription stops the annual recurring subscription charge, but does not refund the transaction for the current billing period. You can continue to access the subscription until the end of the then-current billing period."
        description="Billing details disclaimer text before the line break in the billing details page"
        values={{
          trialDays: SUBSCRIPTION_TRIAL_LENGTH_DAYS,
          price: (<DisplayPrice value={yearlySubscriptionCostForQuantity ?? 0} />),
        }}
      />
      <br /><br />
      <FormattedMessage
        id="checkout.billingDetails.disclaimer.afterBreak"
        defaultMessage="After your {trialDays}-day free trial ends, you will be charged {price} USD on {trialEndDate}, then, annually until you cancel your subscription. The above total includes any applicable taxes."
        description="Billing details disclaimer text after the line break in the billing details page"
        values={{
          trialDays: SUBSCRIPTION_TRIAL_LENGTH_DAYS,
          price: (<DisplayPrice value={yearlySubscriptionCostForQuantity ?? 0} />),
          trialEndDate,
        }}
      />
    </p>
  );
};

export default BillingDetailsDisclaimer;
