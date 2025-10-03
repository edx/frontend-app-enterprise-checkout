import { AppContext } from '@edx/frontend-platform/react';
import { useContext } from 'react';

import useBFFSuccess from '@/components/app/data/hooks/useBFFSuccess';

const useFirstBillableInvoice = () => {
  const { authenticatedUser }: AppContextValue = useContext(AppContext);
  return useBFFSuccess(
    authenticatedUser.userId ?? null,
    {
      select: (data) => data.checkoutIntent?.firstBillableInvoice,
    },
  );
};

export default useFirstBillableInvoice;
