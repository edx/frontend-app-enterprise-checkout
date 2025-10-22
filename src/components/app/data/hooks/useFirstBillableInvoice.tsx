import { AppContext, AppContextValue } from '@edx/frontend-platform/react';
import { useContext } from 'react';

import useBFFSuccess from '@/components/app/data/hooks/useBFFSuccess';

const DEFAULT_INVOICE = {
  billingAddress: {
    city: '',
    country: '',
    line1: '',
    line2: '',
    postalCode: '',
    state: '',
  },
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
          return null;
        }
        const { billingAddress, cardBrand, last4 } = invoice;
        const hasBillingAddress = billingAddress && (
          billingAddress.line1
          && billingAddress.city
          && billingAddress.state
          && billingAddress.postalCode
          && billingAddress.country
        );
        const hasCardDetails = cardBrand && last4;
        return {
          ...DEFAULT_INVOICE,
          ...invoice,
          hasBillingAddress,
          hasCardDetails,
        };
      },
    },
  );
};

export default useFirstBillableInvoice;
