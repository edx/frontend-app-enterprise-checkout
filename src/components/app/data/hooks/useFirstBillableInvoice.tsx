import { AppContext, AppContextValue } from '@edx/frontend-platform/react';
import { useContext } from 'react';

import useBFFSuccess from '@/components/app/data/hooks/useBFFSuccess';

const DEFAULT_INVOICE = {
  billingAddress: null,
  customerPhone: '',
  last4: 0,
  cardBrand: 'card',
  startTime: '',
  endTime: '',
  quantity: 0,
  unitAmountDecimal: 0,
  customerName: '',
};

const useFirstBillableInvoice = () => {
  const { authenticatedUser }: AppContextValue = useContext(AppContext);
  return useBFFSuccess(
    authenticatedUser?.userId ?? null,
    {
      select: (data) => {
        const invoice = data?.checkoutIntent?.firstBillableInvoice;
        if (!invoice) {
          return DEFAULT_INVOICE;
        }
        return {
          ...DEFAULT_INVOICE,
          ...invoice,
        };
      },
    },
  );
};

export default useFirstBillableInvoice;
