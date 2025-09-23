import { getConfig } from '@edx/frontend-platform/config';
import { CheckoutProvider } from '@stripe/react-stripe-js';
import { Appearance, loadStripe } from '@stripe/stripe-js';
import { ReactNode, useMemo } from 'react';

import useCheckoutSessionClientSecret from '@/components/app/data/hooks/useCheckoutSessionClientSecret';
import { createStripeAppearance } from '@/components/StripeProvider/utils';
import { useCheckoutFormStore } from '@/hooks/useCheckoutFormStore';

type StripeProviderProps = {
  children: ReactNode;
};

const StripeProvider = ({ children }: StripeProviderProps) => {
  const { PUBLISHABLE_STRIPE_API_KEY } = getConfig();
  const stripePromise = useMemo(() => loadStripe(PUBLISHABLE_STRIPE_API_KEY), [PUBLISHABLE_STRIPE_API_KEY]);
  const appearance: Appearance = useMemo(() => createStripeAppearance(), []);
  const checkoutSessionClientSecret = useCheckoutSessionClientSecret();
  const checkoutSessionStatus = useCheckoutFormStore(state => state.checkoutSessionStatus);
  // Approach #1: Use react useEffect to check state of client secret updates
  //
  // if (checkoutSessionStatus.type === 'complete') {
  //   return null;
  // }

  if (!checkoutSessionClientSecret) {
    return null;
  }

  return (
    <CheckoutProvider
      stripe={stripePromise}
      options={{
        fetchClientSecret: () => Promise.resolve(checkoutSessionClientSecret),
        elementsOptions: { appearance },
      }}
    >
      {children}
    </CheckoutProvider>
  );
};

export default StripeProvider;
