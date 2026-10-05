import { AppContext } from '@edx/frontend-platform/react';
import { keepPreviousData as keepPreLoginPrice } from '@tanstack/react-query';
import { useContext, useMemo } from 'react';

import useBFFContext from '@/components/app/data/hooks/useBFFContext';
import { DataStoreKey } from '@/constants/checkout';
import { useCheckoutFormStore } from '@/hooks/useCheckoutFormStore';
import { buildCheckoutProductProperties, CheckoutProductProperties } from '@/utils/checkoutEvents';

/**
 * Returns the product properties attached to every normalized checkout Segment event,
 * derived from the BFF price matching the selected SSP product slug.
 */
const useCheckoutEventProductProperties = (): CheckoutProductProperties => {
  const { authenticatedUser }: AppContextValue = useContext(AppContext);
  const sspProductSlug = useCheckoutFormStore((state) => state.sspProductSlug);
  const selectedProduct = useCheckoutFormStore(
    (state) => state.formData[DataStoreKey.AcademySelection]?.selectedProduct,
  );
  const { data: price } = useBFFContext(authenticatedUser?.userId ?? null, {
    // Keep the pre-login price while the user's context loads, so events sent right after login keep product fields.
    placeholderData: keepPreLoginPrice,
    select: (data): CheckoutContextPrice | null => {
      // The checkout intent's SSP product is the source of truth once it exists.
      const slug = data?.checkoutIntent?.sspProduct || sspProductSlug;
      return data?.pricing?.prices?.find((p) => p.sspProductSlug === slug) ?? null;
    },
  });

  return useMemo(
    () => buildCheckoutProductProperties({ price, selectedProduct }),
    [price, selectedProduct],
  );
};

export default useCheckoutEventProductProperties;
