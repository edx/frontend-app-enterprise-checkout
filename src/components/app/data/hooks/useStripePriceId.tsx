import { UseQueryResult } from '@tanstack/react-query';

import useBFFContext from './useBFFContext';

export const extractPriceId = (pricing: CheckoutContextPricing): CheckoutContextPrice['id'] | null => {
  if (!pricing.prices.length) {
    return null;
  }
  const matched = pricing.prices.find((price) => price.lookupKey.includes(pricing.defaultByLookupKey));
  return matched?.id ?? null;
};

const useStripePriceId = (): UseQueryResult<CheckoutContextPrice['id'] | null> => {
  const stripePriceId = useBFFContext<CheckoutContextPrice['id'] | null>(
    null,
    {
      select: (data: CheckoutContextResponse): CheckoutContextPrice['id'] | null => {
        if (!data.pricing) {
          return null;
        }
        return extractPriceId(data.pricing);
      },
    },
  );
  return stripePriceId;
};

export default useStripePriceId;
