import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { Button, Card, Stack } from '@openedx/paragon';
import { Link, useParams } from 'react-router-dom';

import { DisplayPrice } from '@/components/DisplayPrice';
import {
  CheckoutStepKey, CheckoutStepperPath,
  SUBSCRIPTION_PRICE_PER_USER_PER_MONTH,
} from '@/components/Stepper/constants';
import useCheckoutFormStore from '@/hooks/useCheckoutFormStore';

function calculateSubscriptionCost(numUsers?: number) {
  if (!numUsers) {
    return null;
  }
  return numUsers * (SUBSCRIPTION_PRICE_PER_USER_PER_MONTH * 12);
}

const SubscriptionSummary: React.FC = () => {
  const { step } = useParams<{ step: CheckoutStepKey }>();
  const numUsers = useCheckoutFormStore((state) => state.formData.planDetails?.numUsers);
  const totalSubscriptionCost = calculateSubscriptionCost(numUsers);
  return (
    <Card variant="muted">
      <Card.Header title="Purchase Summary" subtitle="Review your selected subscription." size="sm" />
      <Card.Section>
        <Stack gap={3}>
          <Card className="shadow-none border border-light" aria-live="polite">
            <Card.Section className="small">
              <Stack gap={2}>
                <Stack direction="horizontal" gap={2} className="justify-content-between align-items-center">
                  <div>
                    <FormattedMessage
                      id="checkout.subscriptionSummary.price.monthly"
                      defaultMessage="Team Subscription, price per user per month"
                      description="Label for the team plan (monthly)"
                    />
                  </div>
                  <div className="text-right">
                    <DisplayPrice value={SUBSCRIPTION_PRICE_PER_USER_PER_MONTH} />
                  </div>
                </Stack>
                <Stack direction="horizontal" gap={2} className="justify-content-between align-items-start">
                  <div>
                    <FormattedMessage
                      id="checkout.subscriptionSummary.licenses"
                      defaultMessage="Number of licenses"
                      description="Label for the number of licenses"
                    />
                    {step !== CheckoutStepKey.PlanDetails && (
                      <Button
                        as={Link}
                        variant="link"
                        size="inline"
                        className="ml-1"
                        to={CheckoutStepperPath.PlanDetailsRoute}
                      >
                        <FormattedMessage
                          id="checkout.subscriptionSummary.editNumUsers"
                          defaultMessage="Edit"
                          description="Label for the edit number of users button"
                        />
                      </Button>
                    )}
                  </div>
                  <div className="text-right">
                    {numUsers ? `x ${numUsers}` : '-'}
                  </div>
                </Stack>
                <Stack direction="horizontal" gap={2} className="justify-content-between align-items-center">
                  <div>
                    <FormattedMessage
                      id="checkout.subscriptionSummary.total"
                      defaultMessage="Total"
                      description="Label for the total cost"
                    />
                  </div>
                  <div className="text-right">
                    {totalSubscriptionCost
                      ? <DisplayPrice value={totalSubscriptionCost} />
                      : '-'}
                  </div>
                </Stack>
              </Stack>
              <div className="border-top border-muted mt-3 pt-3 font-weight-bold">
                <FormattedMessage
                  id="checkout.subscriptionSummary.annualPayment"
                  defaultMessage="Annual Payment"
                  description="Label for the annual payment"
                />
              </div>
              <Stack gap={2}>
                <Stack direction="horizontal" gap={2} className="justify-content-between align-items-end">
                  <div>
                    <FormattedMessage
                      id="checkout.subscriptionSummary.annualTotal"
                      defaultMessage="Annual total"
                      description="Label for the annual total"
                    />
                  </div>
                  <div className="text-right font-weight-bold">
                    {totalSubscriptionCost
                      ? <DisplayPrice value={totalSubscriptionCost} />
                      : '-'}
                  </div>
                </Stack>
              </Stack>
            </Card.Section>
            <Card.Status variant="info">
              <Stack direction="horizontal" gap={2} className="justify-content-between align-items-center">
                <div>
                  <div className="font-weight-bold">
                    <FormattedMessage
                      id="checkout.subscriptionSummary.todayPayment"
                      defaultMessage="Today's Payment"
                      description="Label for the today's payment"
                    />
                  </div>
                  <div>
                    <FormattedMessage
                      id="checkout.subscriptionSummary.freeTrial"
                      defaultMessage="With 14-day free trial"
                      description="Label for the free trial"
                    />
                  </div>
                </div>
                <div className="text-align-right">
                  {totalSubscriptionCost
                    ? <DisplayPrice value={0} />
                    : '-'}
                </div>
              </Stack>
            </Card.Status>
          </Card>
        </Stack>
      </Card.Section>
    </Card>
  );
};

export default SubscriptionSummary;
