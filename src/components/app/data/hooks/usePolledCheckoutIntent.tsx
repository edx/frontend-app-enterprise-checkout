import { type Query } from '@tanstack/query-core';
import { queryOptions, useQuery } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';

import useCheckoutIntent from '@/components/app/data/hooks/useCheckoutIntent';
import { queryCheckoutIntent } from '@/components/app/data/queries/queries';

const usePolledCheckoutIntent = (): { polledCheckoutIntent: CheckoutIntent | undefined } => {
  const { data: checkoutIntent } = useCheckoutIntent();

  // Use UUID as the primary identifier for CheckoutIntent lookups.
  // UUID is preferred over ID for security (IDs are sequential/guessable).
  // Falls back to ID only for legacy records that might lack a UUID.
  const checkoutIntentIdentifier = checkoutIntent?.uuid ?? checkoutIntent?.id;

  const polledCheckoutIntentQuery = useQuery(
    queryOptions({
      ...queryCheckoutIntent(checkoutIntentIdentifier!),
      // Begin refetching the CheckoutIntent once it becomes known.
      enabled: !!checkoutIntent,
      // Terminate refetching the CheckoutIntent once it becomes fulfilled.
      refetchInterval: (query: Query<any, Error, AxiosResponse<CheckoutIntent>>): number | false => {
        const updatedCheckoutIntentAxiosResponse: AxiosResponse<CheckoutIntent> | undefined = query.state.data;
        const checkoutIntentIsFulfilled = updatedCheckoutIntentAxiosResponse?.data.state === 'fulfilled';
        // False has special meaning, indicating that we want to terminate refetching.
        return checkoutIntentIsFulfilled ? false : 5000;
      },
    }),
  );

  const polledCheckoutIntentAxiosResponse: AxiosResponse<CheckoutIntent> | undefined = polledCheckoutIntentQuery.data;
  const polledCheckoutIntent: CheckoutIntent | undefined = polledCheckoutIntentAxiosResponse?.data;
  return { polledCheckoutIntent };
};

export default usePolledCheckoutIntent;
