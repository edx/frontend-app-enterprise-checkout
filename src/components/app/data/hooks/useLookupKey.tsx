import { AppContext } from '@edx/frontend-platform/react';
import { useContext } from 'react';

import useBFFContext from '@/components/app/data/hooks/useBFFContext';

/**
 * Hook to retrieve the default lookup key from the BFF context.
 */
const useLookupKey = () => {
  const { authenticatedUser }: AppContextValue = useContext(AppContext);
  return useBFFContext<string | null>(
    authenticatedUser?.userId ?? null,
    {
      select: (data: CheckoutContextResponse): string | null => data.pricing?.defaultByLookupKey || null,
    },
  );
};

export default useLookupKey;
