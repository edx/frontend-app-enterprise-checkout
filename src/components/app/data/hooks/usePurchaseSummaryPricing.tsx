import { AppContext } from '@edx/frontend-platform/react';
import { useContext, useMemo } from 'react';

import useBFFContext from '@/components/app/data/hooks/useBFFContext';
import { DataStoreKey } from '@/constants/checkout';
import { useCheckoutFormStore } from '@/hooks/useCheckoutFormStore';
import { extractPriceObject } from '@/utils/checkout';

export function calculateSubscriptionCost(quantity: number, unitAmount?: number | null) {
  if (unitAmount == null) {
    return {
      yearlyCostPerSubscriptionPerUser: null,
      yearlySubscriptionCostForQuantity: null,
    };
  }

  const yearlyCostPerSubscriptionPerUser = unitAmount / 100;
  const yearlySubscriptionCostForQuantity = quantity
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
  const { data: unitAmount } = useBFFContext(authenticatedUser?.userId ?? null, {
    select: (data): CheckoutContextPrice['unitAmount'] | null => {
      if (!data.pricing) {
        return null;
      }
      const priceObject = extractPriceObject(data.pricing);
      if (!priceObject) {
        return null;
      }
      return priceObject.unitAmount;
    },
  });

  // This useMemo can be extended to return different purchase options in the future
  return useMemo(() => calculateSubscriptionCost(quantity, unitAmount), [quantity, unitAmount]);
};

export default usePurchaseSummaryPricing;
