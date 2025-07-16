import { Link, useParams } from 'react-router-dom';
import { Button, Card, Stack } from '@openedx/paragon';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import { SUBSCRIPTION_ANNUAL_PRICE_PER_USER } from '@/components/Stepper/constants';
import Currency from '@/components/SubscriptionSummary/Currency';
import useCheckoutFormStore from '@/hooks/useCheckoutFormStore';

function calculateSubscriptionCost(numUsers?: number) {
  if (!numUsers) {
    return null;
  }
  return numUsers * SUBSCRIPTION_ANNUAL_PRICE_PER_USER;
}

const SubscriptionSummary: React.FC = () => {
  const { step } = useParams<{ step: Step }>();
  const numUsers = useCheckoutFormStore((state) => state.formData.plan?.numUsers);
  const planType = useCheckoutFormStore((state) => state.formData.plan?.planType);
  const totalSubscriptionCost = calculateSubscriptionCost(numUsers);
  return (
    <Card variant="muted">
      <Card.Header title="Subscription Summary" subtitle="Review your selected subscription." size="sm" />
      <Card.Section>
        <Stack gap={3}>
          <Card className="shadow-none border border-light" aria-live="polite">
            <Card.Section className="small">
              <Stack gap={2}>
                <Stack direction="horizontal" gap={2} className="justify-content-between align-items-center">
                  <div>
                    <FormattedMessage
                      id="checkout.subscriptionSummary.price.annual"
                      defaultMessage="Price per user per year"
                      description="Label for the team plan (annual)"
                    />
                  </div>
                  <div className="text-right">
                    <Currency value={SUBSCRIPTION_ANNUAL_PRICE_PER_USER} />
                  </div>
                </Stack>
                <Stack direction="horizontal" gap={2} className="justify-content-between align-items-start">
                  <div>
                    <FormattedMessage
                      id="checkout.subscriptionSummary.users"
                      defaultMessage="Number of users"
                      description="Label for the number of users"
                    />
                    {step !== 'build-trial' && (
                      <Button
                        as={Link}
                        variant="link"
                        size="inline"
                        className="ml-1"
                        to="/build-trial"
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
                      ? <Currency value={totalSubscriptionCost} />
                      : '-'}
                  </div>
                </Stack>
              </Stack>
              <div className="border-top border-muted mt-3 pt-3 font-weight-bold">
                {planType === 'annual' ? (
                  <FormattedMessage
                    id="checkout.subscriptionSummary.annualPayment"
                    defaultMessage="Annual Payment"
                    description="Label for the annual payment"
                  />
                ) : (
                  <FormattedMessage
                    id="checkout.subscriptionSummary.quarterlyPayments"
                    defaultMessage="Quarterly Payments"
                    description="Label for the quarterly payments"
                  />
                )}
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
                      ? <Currency value={totalSubscriptionCost} />
                      : '-'}
                  </div>
                </Stack>
                {planType === 'quarterly' && (
                  <Stack direction="horizontal" gap={2} className="justify-content-between align-items-end">
                    <div>
                      <FormattedMessage
                        id="checkout.subscriptionSummary.quarterlyTotal"
                        defaultMessage="4x quarterly payments"
                        description="Label for the quarterly total"
                      />
                    </div>
                    <div className="text-right">
                      {totalSubscriptionCost
                        ? <Currency value={totalSubscriptionCost / 4} />
                        : '-'}
                    </div>
                  </Stack>
                )}
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
                    ? <Currency value={0} />
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
