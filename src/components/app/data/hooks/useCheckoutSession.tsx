import { AppContext } from '@edx/frontend-platform/react';
import { queryOptions, useQuery, UseQueryResult } from '@tanstack/react-query';
import { useContext } from 'react';

import { baseCheckoutSession } from '@/components/app/data/constants';
import useBFFContext from '@/components/app/data/hooks/useBFFContext';
import { extractPriceId } from '@/components/app/data/hooks/useStripePriceId';
import { queryCheckoutSession } from '@/components/app/data/queries/queries';
import { DataStoreKey } from '@/constants/checkout';
import { useCheckoutFormStore } from '@/hooks/useCheckoutFormStore';

const useCheckoutSession = (): UseQueryResult<CheckoutSessionResponse, null> => {
  const { authenticatedUser }: AppContextValue = useContext(AppContext);
  const { data: context } = useBFFContext(authenticatedUser.userId);
  const { quantity } = useCheckoutFormStore((state) => state.formData[DataStoreKey.PlanDetails]);
  const checkoutSessionPayload: CheckoutSessionSchema = {
    ...baseCheckoutSession,
  };

  if (context?.pricing && context?.checkoutIntent && quantity) {
    Object.assign(
      checkoutSessionPayload,
      {
        stripePriceId: extractPriceId(context.pricing),
        adminEmail: authenticatedUser.email,
        enterpriseSlug: context.checkoutIntent.enterpriseSlug,
        companyName: context.checkoutIntent.enterpriseName,
        quantity,
      },
    );
  }

  return useQuery(
    queryOptions({
      ...queryCheckoutSession(checkoutSessionPayload),
    }),
  ) as UseQueryResult<CheckoutSessionResponse, null>;
};

export default useCheckoutSession;
