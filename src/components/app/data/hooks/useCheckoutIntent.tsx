import { AppContext } from '@edx/frontend-platform/react';
import { useContext } from 'react';

import useBFFContext from '@/components/app/data/hooks/useBFFContext';

const useCheckoutIntent = () => {
  const { authenticatedUser }: AppContextValue = useContext(AppContext);
  return useBFFContext<CheckoutContextCheckoutIntent | null>(
    authenticatedUser?.userId ?? null,
    {
      select: (data: CheckoutContextResponse): CheckoutContextCheckoutIntent | null => data.checkoutIntent || null,
    },
  );
};

export default useCheckoutIntent;
