import React from 'react';

import { usePurchaseSummaryPricing } from '@/components/app/data';
import { DataStoreKey } from '@/constants/checkout';
import { useCheckoutFormStore } from '@/hooks/index';

import PurchaseSummaryBase from './PurchaseSummaryBase';
import PurchaseSummaryCardButton from './PurchaseSummaryCardButton';

const TeamsPurchaseSummary = () => {
  const quantity = useCheckoutFormStore(
    (state) => state.formData[DataStoreKey.PlanDetails]?.quantity,
  );

  const companyName = useCheckoutFormStore(
    (state) => state.formData[DataStoreKey.AccountDetails]?.companyName,
  );

  const { yearlyCostPerSubscriptionPerUser } = usePurchaseSummaryPricing();

  const normalizedQuantity = parseInt(quantity, 10) === 0 ? null : quantity;

  const totalPerYear = normalizedQuantity && normalizedQuantity > 0 && yearlyCostPerSubscriptionPerUser
    ? normalizedQuantity * yearlyCostPerSubscriptionPerUser
    : null;

  return (
    <PurchaseSummaryBase
      headerName={companyName}
      pricePerUser={yearlyCostPerSubscriptionPerUser}
      quantity={normalizedQuantity}
      totalPerYear={totalPerYear}
      actionButton={<PurchaseSummaryCardButton />}
    />
  );
};

export default React.memo(TeamsPurchaseSummary);
