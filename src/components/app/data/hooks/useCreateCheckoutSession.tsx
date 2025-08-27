import { AppContext } from '@edx/frontend-platform/react';
import { queryOptions, useQuery, UseQueryResult } from '@tanstack/react-query';
import { useContext } from 'react';

import { baseCreateCheckoutSession } from '@/components/app/data/constants';
import useBFFContext from '@/components/app/data/hooks/useBFFContext';
import { extractPriceId } from '@/components/app/data/hooks/useStripePriceId';
import { queryCreateCheckoutSession } from '@/components/app/data/queries/queries';
import { DataStoreKey } from '@/constants/checkout';
import { useCheckoutFormStore } from '@/hooks/useCheckoutFormStore';

const useCreateCheckoutSession = (): UseQueryResult<CreateCheckoutSessionResponse, null> => {
  const { authenticatedUser }: AppContextValue = useContext(AppContext);
  const { data: context } = useBFFContext(authenticatedUser?.userId ?? null);
  const { companyName, enterpriseSlug } = useCheckoutFormStore(
    (state) => state.formData[DataStoreKey.AccountDetails],
  );
  const { quantity, adminEmail, stripePriceId } = useCheckoutFormStore(
    (state) => state.formData[DataStoreKey.PlanDetails],
  );
  const checkoutSessionPayload: CreateCheckoutSessionSchema = {
    ...baseCreateCheckoutSession,
  };

  if (context?.pricing && context?.checkoutIntent && quantity) {
    Object.assign(
      checkoutSessionPayload,
      {
        stripePriceId: stripePriceId ?? extractPriceId(context.pricing),
        adminEmail: adminEmail ?? authenticatedUser.email,
        enterpriseSlug: enterpriseSlug ?? context.checkoutIntent.enterpriseSlug,
        companyName: companyName ?? context.checkoutIntent.enterpriseName,
        quantity,
      },
    );
  }

  return useQuery(
    queryOptions({
      ...queryCreateCheckoutSession(checkoutSessionPayload),
    }),
  ) as UseQueryResult<CreateCheckoutSessionResponse, null>;
};

export default useCreateCheckoutSession;
