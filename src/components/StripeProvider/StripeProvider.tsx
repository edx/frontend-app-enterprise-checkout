import { getConfig } from '@edx/frontend-platform/config';
import { CheckoutProvider } from '@stripe/react-stripe-js';
import { Appearance, loadStripe } from '@stripe/stripe-js';
import { ReactNode, useMemo } from 'react';

import useCheckoutSessionClientSecret from '@/components/app/data/hooks/useCheckoutSessionClientSecret';
import { createStripeAppearance } from '@/components/StripeProvider/utils';

type StripeProviderProps = {
  children: ReactNode;
};

const StripeProvider = ({ children }: StripeProviderProps) => {
  const { PUBLISHABLE_STRIPE_API_KEY } = getConfig();
  const stripePromise = useMemo(() => loadStripe(PUBLISHABLE_STRIPE_API_KEY), [PUBLISHABLE_STRIPE_API_KEY]);
  const appearance: Appearance = useMemo(() => createStripeAppearance(), []);
  const checkoutSessionClientSecret = useCheckoutSessionClientSecret();

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

// @ts-ignore
export default StripeProvider;
