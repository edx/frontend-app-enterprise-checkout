import { AppContext } from '@edx/frontend-platform/react';
import { useContext, useMemo } from 'react';

import useBFFContext from '@/components/app/data/hooks/useBFFContext';
import { DataStoreKey } from '@/constants/checkout';
import { useCheckoutFormStore } from '@/hooks/useCheckoutFormStore';
import { extractPriceObject } from '@/utils/checkout';
import { buildCheckoutProductProperties, CheckoutProductProperties } from '@/utils/checkoutEvents';
import { isEssentialsFlow } from '@/utils/common';

/**
 * Returns the product properties attached to every normalized checkout Segment event,
 * derived from the BFF pricing and the product selected in the checkout form store.
 */
const useCheckoutEventProductProperties = (): CheckoutProductProperties => {
  const { authenticatedUser }: AppContextValue = useContext(AppContext);
  const productLookupKey = useCheckoutFormStore((state) => state.productLookupKey);
  const sspProductSlug = useCheckoutFormStore((state) => state.sspProductSlug);
  const academyName = useCheckoutFormStore(
    (state) => state.formData[DataStoreKey.AcademySelection]?.selectedProduct?.name,
  );
  const { data: price } = useBFFContext(authenticatedUser?.userId ?? null, {
    select: (data): CheckoutContextPrice | null => (
      data?.pricing ? extractPriceObject(data.pricing, productLookupKey) : null
    ),
  });
  const isEssentials = isEssentialsFlow();

  return useMemo(() => buildCheckoutProductProperties({
    price,
    isEssentials,
    academyName,
    sspProductSlug,
  }), [price, isEssentials, academyName, sspProductSlug]);
};

export default useCheckoutEventProductProperties;
