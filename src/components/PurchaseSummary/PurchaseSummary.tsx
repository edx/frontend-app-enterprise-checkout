import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';
import { Card, Stack } from '@openedx/paragon';
import classNames from 'classnames';
import { useContext, useMemo } from 'react';

import { useBFFContext } from '@/components/app/data';
import { DisplayPrice } from '@/components/DisplayPrice';
import {
  DataStoreKey,
  SUBSCRIPTION_PRICE_PER_USER_PER_MONTH,
} from '@/constants/checkout';
import {
  useCheckoutFormStore,
} from '@/hooks/index';
import { extractPriceObject } from '@/utils/checkout';

function calculateSubscriptionCost(quantity?: number) {
  const yearlyCostPerSubscriptionPerUser = SUBSCRIPTION_PRICE_PER_USER_PER_MONTH * 12;
  if (!quantity) {
    return {
      yearlyCostPerSubscriptionPerUser,
      yearlySubscriptionCostForQuantity: null,
    };
  }
  const yearlySubscriptionCostForQuantity = yearlyCostPerSubscriptionPerUser * quantity;
  return {
    yearlyCostPerSubscriptionPerUser,
    yearlySubscriptionCostForQuantity,
  };
}

const SubscriptionSummary: React.FC = () => {
  const { authenticatedUser }: AppContextValue = useContext(AppContext);
  const quantity = useCheckoutFormStore((state) => state.formData[DataStoreKey.PlanDetails]?.quantity);
  const companyName = useCheckoutFormStore((state) => state.formData[DataStoreKey.AccountDetails].companyName);
  const { data: pricing } = useBFFContext(authenticatedUser.userId, {
    select: (data => {
      if (!data.pricing) {
        return null;
      }
      return extractPriceObject(data.pricing);
    }),
  });
  const {
    yearlyCostPerSubscriptionPerUser,
    yearlySubscriptionCostForQuantity,
  } = useMemo(() => calculateSubscriptionCost(quantity), [quantity]);
  return (
    <Card>
      <Card.Header
        title="Purchase summary"
        subtitle={companyName ? `For ${companyName}` : '-'}
        size="md"
      />
      <Card.Section className="pt-2">
        <Stack>
          <Stack gap={6} direction="horizontal" className="justify-content-between align-items-start">
            <div>
              <FormattedMessage
                id="checkout.subscriptionSummary.yearlyPricePerUser.text"
                defaultMessage="Team Subscription, price per user, paid yearly"
                description="Label for the team plan per user per year"
              />
            </div>
            <div className="text-right font-weight-bold">
              <DisplayPrice value={yearlyCostPerSubscriptionPerUser} />
            </div>
          </Stack>
          <Stack gap={6} direction="horizontal" className="justify-content-between align-items-start">
            <div>
              <FormattedMessage
                id="checkout.subscriptionSummary.licenses.text"
                defaultMessage="Number of licenses"
                description="Label for the number of licenses"
              />
            </div>
            <div className="text-right">
              {quantity ? `x${quantity}` : '-'}
            </div>
          </Stack>
          <hr className="w-100" />
          <Stack gap={6} direction="horizontal" className="justify-content-between align-items-start">
            <div>
              <FormattedMessage
                id="checkout.subscriptionSummary.totalPricePerYear.text"
                defaultMessage="Total after trial"
                description="Label for the total price for all users per year"
              />
            </div>
            <div className={classNames('text-right', {
              'font-weight-bold': quantity > 0,
              'pb-4.5': !quantity,
            })}
            >
              {quantity
                ? (
                  <span>
                    <DisplayPrice value={yearlySubscriptionCostForQuantity!} /> USD
                  </span>
                )
                : '-'}/yr
            </div>
          </Stack>
          <Stack gap={6} direction="horizontal" className="align-self-end w-75 text-right">
            {quantity && (
            <FormattedMessage
              id="checkout.subscriptionSummary.a.text"
              defaultMessage="Auto-renews annually at {price}/yr. Cancel at any time."
              description="Auto renew disclaimer indicating price and cancellation"
              values={{
                price: <DisplayPrice value={yearlySubscriptionCostForQuantity!} />,
              }}
            />
            )}
          </Stack>
          <Stack gap={6} direction="horizontal" className="justify-content-between">
            <div>
              <FormattedMessage
                id="checkout.subscriptionSummary.dueToday.text"
                defaultMessage="Due today"
                description="Label for the amount due by the user on successful checkout"
              />
            </div>
            <div className="text-right font-weight-bold">
              <DisplayPrice value={yearlySubscriptionCostForQuantity! || 0} />
            </div>
          </Stack>
        </Stack>
      </Card.Section>
    </Card>
  );
};

export default SubscriptionSummary;
