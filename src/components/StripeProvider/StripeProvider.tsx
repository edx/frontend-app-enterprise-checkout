import { getConfig } from '@edx/frontend-platform/config';
import { CheckoutProvider } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { ReactNode } from 'react';

import { useCheckoutSession } from '@/components/app/data';

type StripeProviderProps = {
  children: ReactNode;
};

const StripeProvider = ({ children }: StripeProviderProps) => {
  const { PUBLISHABLE_STRIPE_API_KEY } = getConfig();
  const stripePromise = loadStripe(PUBLISHABLE_STRIPE_API_KEY);
  const { data: stripeCheckoutSession } = useCheckoutSession();

  if (!stripeCheckoutSession) {
    return null;
  }

  return (
    <CheckoutProvider
      stripe={stripePromise}
      options={{
        fetchClientSecret: () => Promise.resolve(stripeCheckoutSession.checkoutSessionClientSecret),
      }}
    >
      {children}
    </CheckoutProvider>
  );
};

// @ts-ignore
export default StripeProvider;
