import { AppContext } from '@edx/frontend-platform/react';
import { queryOptions, useQuery } from '@tanstack/react-query';
import { useContext } from 'react';

import useBFFSuccess from '@/components/app/data/hooks/useBFFSuccess';
import { queryCreateBillingPortalSession } from '@/components/app/data/queries/queries';

const useCreateBillingPortalSession = (options = {}) => {
  const { authenticatedUser }: AppContextValue = useContext(AppContext);
  const { data: contextData } = useBFFSuccess(authenticatedUser.userId);
  const { checkoutIntent } = contextData ?? {};
  return useQuery(
    queryOptions({
      ...queryCreateBillingPortalSession(checkoutIntent?.id),
      ...options,
      enabled: !!checkoutIntent?.id,
    }),
  );
};

export default useCreateBillingPortalSession;
