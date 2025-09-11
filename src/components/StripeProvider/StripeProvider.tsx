import { getConfig } from '@edx/frontend-platform/config';
import { CheckoutProvider } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { ReactNode } from 'react';

import useCheckoutSessionClientSecret from '@/components/app/data/hooks/useCheckoutSessionClientSecret';

type StripeProviderProps = {
  children: ReactNode;
};

const StripeProvider = ({ children }: StripeProviderProps) => {
  const { PUBLISHABLE_STRIPE_API_KEY } = getConfig();
  const stripePromise = loadStripe(PUBLISHABLE_STRIPE_API_KEY);
  const checkoutSessionClientSecret = useCheckoutSessionClientSecret();

  if (!checkoutSessionClientSecret) {
    return null;
  }

  return (
    <CheckoutProvider
      stripe={stripePromise}
      options={{
        fetchClientSecret: () => Promise.resolve(checkoutSessionClientSecret),
      }}
    >
      {children}
    </CheckoutProvider>
  );
};

// @ts-ignore
export default StripeProvider;
