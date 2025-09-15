import { getConfig } from '@edx/frontend-platform/config';
import { CheckoutProvider } from '@stripe/react-stripe-js';
import { Appearance, loadStripe } from '@stripe/stripe-js';
import { ReactNode, useMemo } from 'react';

import useCreateCheckoutSession from '@/components/app/data/hooks/useCreateCheckoutSession';
import { createStripeAppearance } from '@/components/StripeProvider/utils';

type StripeProviderProps = {
  children: ReactNode;
};

const StripeProvider = ({ children }: StripeProviderProps) => {
  const { PUBLISHABLE_STRIPE_API_KEY } = getConfig();
  const stripePromise = useMemo(() => loadStripe(PUBLISHABLE_STRIPE_API_KEY), [PUBLISHABLE_STRIPE_API_KEY]);
  const { data: stripeCheckoutSession } = useCreateCheckoutSession();
  const appearance: Appearance = useMemo(() => createStripeAppearance(), []);

  if (!stripeCheckoutSession) {
    return null;
  }

  return (
    <CheckoutProvider
      stripe={stripePromise}
      options={{
        fetchClientSecret: () => Promise.resolve(stripeCheckoutSession.checkoutSessionClientSecret),
        elementsOptions: { appearance },
      }}
    >
      {children}
    </CheckoutProvider>
  );
};

export default StripeProvider;
