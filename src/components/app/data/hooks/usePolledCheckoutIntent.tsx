import { queryOptions, useQuery } from '@tanstack/react-query';

import useCheckoutIntent from '@/components/app/data/hooks/useCheckoutIntent';
import { queryCheckoutIntent } from '@/components/app/data/queries/queries';

const usePolledCheckoutIntent = () => {
  const { data: checkoutIntent } = useCheckoutIntent();

  const polledCheckoutIntent = useQuery(
    queryOptions({
      ...queryCheckoutIntent(checkoutIntent!.id),
      refetchInterval: (queryMetadata) => {
        if (queryMetadata.state.data?.state === 'fulfilled') {
          return false;
        }
        return 5000;
      },
      enabled: !!checkoutIntent!.id,
    }),
  );
  return polledCheckoutIntent;
};

export default usePolledCheckoutIntent;
