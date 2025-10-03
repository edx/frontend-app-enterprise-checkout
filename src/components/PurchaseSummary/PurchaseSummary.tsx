import { Card, Stack } from '@openedx/paragon';
import React from 'react';

import { usePurchaseSummaryPricing } from '@/components/app/data';
import { DataStoreKey } from '@/constants/checkout';
import { useCheckoutFormStore } from '@/hooks/index';

import AutoRenewNotice from './AutoRenewNotice';
import DueTodayRow from './DueTodayRow';
import LicensesRow from './LicensesRow';
import PricePerUserRow from './PricePerUserRow';
import PurchaseSummaryCardButton from './PurchaseSummaryCardButton';
import PurchaseSummaryHeader from './PurchaseSummaryHeader';
import TotalAfterTrialRow from './TotalAfterTrialRow';

const PurchaseSummary: React.FC = () => {
  const quantity = useCheckoutFormStore((state) => state.formData[DataStoreKey.PlanDetails]?.quantity);
  const companyName = useCheckoutFormStore((state) => state.formData[DataStoreKey.AccountDetails].companyName);
  const {
    yearlySubscriptionCostForQuantity,
    yearlyCostPerSubscriptionPerUser,
  } = usePurchaseSummaryPricing();

  // TODO: Fix bug, quantity should be returned as a number instead of a string, we have been assuming a number
  const normalizedQuantity = parseInt(quantity, 10) === 0 ? null : quantity;

  return (
    <Card>
      <PurchaseSummaryHeader companyName={companyName} />
      <Card.Section className="pt-2">
        <Stack>
          <PricePerUserRow pricePerUser={yearlyCostPerSubscriptionPerUser} />
          <LicensesRow quantity={normalizedQuantity} />
          <hr className="w-100" />
          <TotalAfterTrialRow quantity={normalizedQuantity} totalPerYear={yearlySubscriptionCostForQuantity} />
          <AutoRenewNotice quantity={normalizedQuantity} totalPerYear={yearlySubscriptionCostForQuantity} />
          <DueTodayRow amountDue={yearlySubscriptionCostForQuantity ?? 0} />
        </Stack>
      </Card.Section>
      <Card.Footer>
        <PurchaseSummaryCardButton />
      </Card.Footer>
    </Card>
  );
};

export default React.memo(PurchaseSummary);
