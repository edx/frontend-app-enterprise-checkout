import { type Query } from '@tanstack/query-core';
import { queryOptions, useQuery } from '@tanstack/react-query';

import useCheckoutIntent from '@/components/app/data/hooks/useCheckoutIntent';
import { queryCheckoutIntent } from '@/components/app/data/queries/queries';

const usePolledCheckoutIntent = () => {
  const { data: checkoutIntent } = useCheckoutIntent();

  return useQuery(
    queryOptions({
      ...queryCheckoutIntent(checkoutIntent!.uuid || checkoutIntent!.id.toString()),
      enabled: !!checkoutIntent,
      // Terminate refetching the CheckoutIntent once it comes back fulfilled.
      refetchInterval: (query: Query<any, Error, CheckoutIntent>): number | false => {
        const updatedCheckoutIntent = query.state.data;
        const checkoutIntentIsFulfilled = updatedCheckoutIntent?.state === 'fulfilled';
        // False has special meaning, indicating that we want to terminate refetching.
        return checkoutIntentIsFulfilled ? false : 5000;
      },
    }),
  );
};

export default usePolledCheckoutIntent;
