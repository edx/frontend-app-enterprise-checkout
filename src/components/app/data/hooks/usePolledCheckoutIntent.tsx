import { AppContext } from '@edx/frontend-platform/react';
import { queryOptions, useQuery, useQueryClient } from '@tanstack/react-query';
import { useContext } from 'react';

import useCheckoutIntent from '@/components/app/data/hooks/useCheckoutIntent';
import { queryBffContext, queryBffSuccess, queryCheckoutIntent } from '@/components/app/data/queries/queries';

const usePolledCheckoutIntent = () => {
  const { data: checkoutIntent } = useCheckoutIntent();
  const queryClient = useQueryClient();
  const { authenticatedUser }: AppContextValue = useContext(AppContext);

  const polledCheckoutIntent = useQuery(
    queryOptions({
      ...queryCheckoutIntent(checkoutIntent!.id),
      refetchInterval: (queryMetadata) => {
        Promise.all(
          [queryClient.invalidateQueries({
            queryKey: queryBffContext(authenticatedUser.id).queryKey,
          }),
          queryClient.invalidateQueries({
            queryKey: queryBffSuccess(authenticatedUser.id).queryKey,
          })],
        );
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
