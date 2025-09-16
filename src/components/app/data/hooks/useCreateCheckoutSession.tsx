import { queryOptions, useQuery, UseQueryResult } from '@tanstack/react-query';

import { baseCreateCheckoutSession } from '@/components/app/data/constants';
import { queryCreateCheckoutSession } from '@/components/app/data/queries/queries';
import { DataStoreKey } from '@/constants/checkout';
import { useCheckoutFormStore } from '@/hooks/useCheckoutFormStore';

const useCreateCheckoutSession = (): UseQueryResult<CreateCheckoutSessionResponse, null> => {
  const { companyName, enterpriseSlug } = useCheckoutFormStore(
    (state) => state.formData[DataStoreKey.AccountDetails],
  );
  const { quantity, adminEmail, stripePriceId } = useCheckoutFormStore(
    (state) => state.formData[DataStoreKey.PlanDetails],
  );
  const checkoutSessionPayload: CreateCheckoutSessionSchema = {
    ...baseCreateCheckoutSession,
  };

  Object.assign(
    checkoutSessionPayload,
    {
      stripePriceId,
      adminEmail,
      enterpriseSlug,
      companyName,
      quantity,
    },
  );

  return useQuery(
    queryOptions({
      ...queryCreateCheckoutSession(checkoutSessionPayload),
      retry: false,
    }),
  ) as UseQueryResult<CreateCheckoutSessionResponse, null>;
};

export default useCreateCheckoutSession;
