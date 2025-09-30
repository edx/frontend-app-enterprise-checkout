import { queryOptions, useQuery } from '@tanstack/react-query';

import { useCheckoutIntent } from '@/components/app/data';
import { queryCheckoutIntent } from '@/components/app/data/queries/queries';

const usePolledCheckoutIntent = () => {
  const { data: checkoutIntent } = useCheckoutIntent();
  const options = {
    refetchInterval: (data, query) => {
      console.log('data', data);
      console.log('query', query);
      if (data?.status === 'pending') {
        return 1000;
      }
      return false;
    },
  };
  const polledCheckoutIntent = useQuery(
    queryOptions({
      ...queryCheckoutIntent(checkoutIntent!.id),
      refetchInterval: (data) => {
        console.log('data', data);
        return 30000;
      },
    }),
  );
  return polledCheckoutIntent;
};

export default usePolledCheckoutIntent;
