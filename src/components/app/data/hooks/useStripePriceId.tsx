import { AppContext } from '@edx/frontend-platform/react';
import { UseQueryResult } from '@tanstack/react-query';
import { useContext } from 'react';

import useBFFContext from './useBFFContext';

export const extractPriceId = (pricing: CheckoutContextPricing): CheckoutContextPrice['id'] | null => {
  if (!pricing.prices.length) {
    return null;
  }
  const matched = pricing.prices.find((price) => price.lookupKey.includes(pricing.defaultByLookupKey));
  return matched?.id ?? null;
};

const useStripePriceId = (): UseQueryResult<CheckoutContextPrice['id'] | null> => {
  const { authenticatedUser }: AppContextValue = useContext(AppContext);
  const stripePriceId = useBFFContext<CheckoutContextPrice['id'] | null>(
    authenticatedUser?.userId ?? null,
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
