import { getConfig } from '@edx/frontend-platform/config';
import { CheckoutProvider } from '@stripe/react-stripe-js';
import { Appearance, loadStripe } from '@stripe/stripe-js';
import { ReactElement, useMemo } from 'react';

import { useCheckoutSessionClientSecret } from '@/components/app/data';
import { createStripeAppearance } from '@/components/StripeProvider/utils';

type StripeProviderProps = {
  children: ReactElement;
};

const StripeProvider = ({ children }: StripeProviderProps): JSX.Element | null => {
  const { PUBLISHABLE_STRIPE_API_KEY } = getConfig();
  const stripePromise = useMemo(
    () => (PUBLISHABLE_STRIPE_API_KEY ? loadStripe(PUBLISHABLE_STRIPE_API_KEY) : null),
    [PUBLISHABLE_STRIPE_API_KEY],
  );
  const appearance: Appearance = useMemo(() => createStripeAppearance(), []);
  const checkoutSessionClientSecret = useCheckoutSessionClientSecret();

  // If we don't have the prerequisites for Stripe, render the page shell without Stripe Elements.
  if (!checkoutSessionClientSecret || !PUBLISHABLE_STRIPE_API_KEY || !stripePromise) {
    return children;
  }

  return (
    <CheckoutProvider
      key={checkoutSessionClientSecret}
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
