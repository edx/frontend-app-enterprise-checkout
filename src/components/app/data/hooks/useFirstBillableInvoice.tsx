import { AppContext, AppContextValue } from '@edx/frontend-platform/react';
import { useContext } from 'react';

import useBFFSuccess from '@/components/app/data/hooks/useBFFSuccess';

const DEFAULT_INVOICE = {
  billingAddress: {
    city: null,
    country: null,
    line1: null,
    line2: null,
    postalCode: null,
    state: null,
  },
  customerPhone: null,
  last4: 0,
  cardBrand: 'card',
  startTime: null,
  endTime: null,
  quantity: 0,
  unitAmountDecimal: 0,
  customerName: null,
};

const useFirstBillableInvoice = () => {
  const { authenticatedUser }: AppContextValue = useContext(AppContext);
  return useBFFSuccess(
    authenticatedUser?.userId ?? null,
    {
      select: (data) => {
        const { checkoutIntent = null } = data;
        if (!checkoutIntent) {
          return null;
        }
        const billableInvoice = checkoutIntent?.firstBillableInvoice;
        if (!billableInvoice) {
          return null;
        }
        const { billingAddress, cardBrand, last4 } = billableInvoice;
        const hasBillingAddress = billingAddress && (
          billingAddress.line1
          || billingAddress.city
          || billingAddress.state
          || billingAddress.postalCode
          || billingAddress.country
        );
        const hasCardDetails = cardBrand && last4;
        return {
          ...DEFAULT_INVOICE,
          ...billableInvoice,
          hasBillingAddress,
          hasCardDetails,
        };
      },
    },
  );
};

export default useFirstBillableInvoice;
