import { AppContext } from '@edx/frontend-platform/react';
import { useContext, useMemo } from 'react';

import useBFFContext from '@/components/app/data/hooks/useBFFContext';
import { DataStoreKey } from '@/constants/checkout';
import { useCheckoutFormStore } from '@/hooks/useCheckoutFormStore';
import { extractPriceByProductLookupKey } from '@/utils/checkout';

export function calculateSubscriptionCost(quantity: number, unitAmount?: number | null) {
  if (unitAmount == null) {
    return {
      yearlyCostPerSubscriptionPerUser: null,
      yearlySubscriptionCostForQuantity: null,
    };
  }

  const yearlyCostPerSubscriptionPerUser = unitAmount;
  const yearlySubscriptionCostForQuantity = quantity && quantity > 0
    ? yearlyCostPerSubscriptionPerUser * quantity
    : null;

  return {
    yearlyCostPerSubscriptionPerUser,
    yearlySubscriptionCostForQuantity,
  };
}

const usePurchaseSummaryPricing = () => {
  const { authenticatedUser }:AppContextValue = useContext(AppContext);
  const { quantity } = useCheckoutFormStore((state) => state.formData[DataStoreKey.PlanDetails]);
  const productLookupKey = useCheckoutFormStore((state) => state.productLookupKey);
  const { data: unitAmount } = useBFFContext(authenticatedUser?.userId ?? null, {
    select: (data): number | null => extractPriceByProductLookupKey(data?.pricing, productLookupKey),
  });
  // This useMemo can be extended to return different purchase options in the future
  return useMemo(() => calculateSubscriptionCost(quantity, unitAmount), [quantity, unitAmount]);
};

export default usePurchaseSummaryPricing;
