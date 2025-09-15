import { AppContext } from '@edx/frontend-platform/react';
import { useContext } from 'react';

import useBFFContext from '@/components/app/data/hooks/useBFFContext';

const useCheckoutIntent = () => {
  const { authenticatedUser }: AppContextValue = useContext(AppContext);
  const checkoutIntent = useBFFContext<CheckoutContextCheckoutIntent | null>(
    authenticatedUser?.userId ?? null,
    {
      select: (data: CheckoutContextResponse): CheckoutContextCheckoutIntent | null => {
        if (data.checkoutIntent) {
          return data.checkoutIntent;
        }
        return null;
      },
    },
  );
  return checkoutIntent;
};

export default useCheckoutIntent;
