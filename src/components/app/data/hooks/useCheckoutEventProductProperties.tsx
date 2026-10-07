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
    placeholderData: keepPreLoginPrice,
    select: (data): CheckoutContextPrice | null => {
      const slug = sspProductSlug || data?.checkoutIntent?.sspProduct;
      return data?.pricing?.prices?.find((p) => p.sspProductSlug === slug) ?? null;
    },
  });

  return useMemo(
    () => buildCheckoutProductProperties({ price, selectedProduct }),
    [price, selectedProduct],
  );
};

export default useCheckoutEventProductProperties;
