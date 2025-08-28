import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { Card, Stack } from '@openedx/paragon';

import { DisplayPrice } from '@/components/DisplayPrice';
import {
  DataStoreKey,
  SUBSCRIPTION_PRICE_PER_USER_PER_MONTH,
} from '@/constants/checkout';
import {
  useCheckoutFormStore,
  useCurrentStep,
} from '@/hooks/index';

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
  const { currentStep } = useCurrentStep();
  const quantity = useCheckoutFormStore((state) => state.formData[DataStoreKey.PlanDetails]?.quantity);
  const companyName = useCheckoutFormStore((state) => state.formData[DataStoreKey.AccountDetails].companyName);

  const {
    yearlyCostPerSubscriptionPerUser,
    yearlySubscriptionCostForQuantity,
  } = calculateSubscriptionCost(quantity);
  return (
    <Card>
      <Card.Header
        title="Purchase summary"
        subtitle={companyName && `For ${companyName}`}
        size="md"
      />
      <Card.Section>
        <Stack>
          <Stack gap={6} direction="horizontal" className="justify-content-between align-items-start">
            <div>
              <FormattedMessage
                id="checkout.subscriptionSummary.yearlyPrice.text"
                defaultMessage="Team Subscription, price per user, paid yearly"
                description="Label for the team plan (monthly)"
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
        </Stack>
        {/* <Stack gap={3}> */}
        {/*  <Card className="shadow-none" aria-live="polite"> */}
        {/*    <Card.Section className="small"> */}
        {/*      <Stack gap={2}> */}
        {/*        <Stack direction="horizontal" gap={2} className="justify-content-between align-items-center"> */}
        {/*          <div> */}
        {/*            <FormattedMessage */}
        {/*              id="checkout.subscriptionSummary.price.monthly" */}
        {/*              defaultMessage="Team Subscription, price per user per month" */}
        {/*              description="Label for the team plan (monthly)" */}
        {/*            /> */}
        {/*          </div> */}
        {/*          <div className="text-right"> */}
        {/*            <DisplayPrice value={SUBSCRIPTION_PRICE_PER_USER_PER_MONTH} /> */}
        {/*          </div> */}
        {/*        </Stack> */}
        {/*        <Stack direction="horizontal" gap={2} className="justify-content-between align-items-start"> */}
        {/*          <div> */}
        {/*            <FormattedMessage */}
        {/*              id="checkout.subscriptionSummary.licenses" */}
        {/*              defaultMessage="Number of licenses" */}
        {/*              description="Label for the number of licenses" */}
        {/*            /> */}
        {/*            {currentStep !== DataStoreKey.PlanDetails && ( */}
        {/*              <Button */}
        {/*                as={Link} */}
        {/*                variant="link" */}
        {/*                size="inline" */}
        {/*                className="ml-1" */}
        {/*                to={CheckoutPageRoute.PlanDetails} */}
        {/*              > */}
        {/*                <FormattedMessage */}
        {/*                  id="checkout.subscriptionSummary.editQuantity" */}
        {/*                  defaultMessage="Edit" */}
        {/*                  description="Label for the edit number of users button" */}
        {/*                /> */}
        {/*              </Button> */}
        {/*            )} */}
        {/*          </div> */}
        {/*          <div className="text-right"> */}
        {/*            {quantity ? `x ${quantity}` : '-'} */}
        {/*          </div> */}
        {/*        </Stack> */}
        {/*        <Stack direction="horizontal" gap={2} className="justify-content-between align-items-center"> */}
        {/*          <div> */}
        {/*            <FormattedMessage */}
        {/*              id="checkout.subscriptionSummary.total" */}
        {/*              defaultMessage="Total" */}
        {/*              description="Label for the total cost" */}
        {/*            /> */}
        {/*          </div> */}
        {/*          <div className="text-right"> */}
        {/*            {totalSubscriptionCost */}
        {/*              ? <DisplayPrice value={totalSubscriptionCost} /> */}
        {/*              : '-'} */}
        {/*          </div> */}
        {/*        </Stack> */}
        {/*      </Stack> */}
        {/*      <div className="border-top border-muted mt-3 pt-3 font-weight-bold"> */}
        {/*        <FormattedMessage */}
        {/*          id="checkout.subscriptionSummary.annualPayment" */}
        {/*          defaultMessage="Annual Payment" */}
        {/*          description="Label for the annual payment" */}
        {/*        /> */}
        {/*      </div> */}
        {/*      <Stack gap={2}> */}
        {/*        <Stack direction="horizontal" gap={2} className="justify-content-between align-items-end"> */}
        {/*          <div> */}
        {/*            <FormattedMessage */}
        {/*              id="checkout.subscriptionSummary.annualTotal" */}
        {/*              defaultMessage="Annual total" */}
        {/*              description="Label for the annual total" */}
        {/*            /> */}
        {/*          </div> */}
        {/*          <div className="text-right font-weight-bold"> */}
        {/*            {totalSubscriptionCost */}
        {/*              ? <DisplayPrice value={totalSubscriptionCost} /> */}
        {/*              : '-'} */}
        {/*          </div> */}
        {/*        </Stack> */}
        {/*      </Stack> */}
        {/*    </Card.Section> */}
        {/*    <Card.Status variant="info"> */}
        {/*      <Stack direction="horizontal" gap={2} className="justify-content-between align-items-center"> */}
        {/*        <div> */}
        {/*          <div className="font-weight-bold"> */}
        {/*            <FormattedMessage */}
        {/*              id="checkout.subscriptionSummary.todayPayment" */}
        {/*              defaultMessage="Today's Payment" */}
        {/*              description="Label for the today's payment" */}
        {/*            /> */}
        {/*          </div> */}
        {/*          <div> */}
        {/*            <FormattedMessage */}
        {/*              id="checkout.subscriptionSummary.freeTrial" */}
        {/*              defaultMessage="With 14-day free trial" */}
        {/*              description="Label for the free trial" */}
        {/*            /> */}
        {/*          </div> */}
        {/*        </div> */}
        {/*        <div className="text-align-right"> */}
        {/*          {totalSubscriptionCost */}
        {/*            ? <DisplayPrice value={0} /> */}
        {/*            : '-'} */}
        {/*        </div> */}
        {/*      </Stack> */}
        {/*    </Card.Status> */}
        {/*  </Card> */}
        {/* </Stack> */}
      </Card.Section>
    </Card>
  );
};

export default SubscriptionSummary;
