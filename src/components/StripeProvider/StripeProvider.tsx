import { getConfig } from '@edx/frontend-platform/config';
import { CheckoutProvider } from '@stripe/react-stripe-js';
import { Appearance, loadStripe } from '@stripe/stripe-js';
import { ReactNode, useMemo } from 'react';

import { useCheckoutSessionClientSecret } from '@/components/app/data';
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

  // Wrap fetchClientSecret so that any non-Error rejection from Stripe's SDK
  // (e.g. a raw API error object like { type: 'invalid_request_error', ... })
  // is converted to a proper Error instance.  Without this conversion the
  // webpack dev overlay shows the unhelpful "[object Object]" message and
  // React Router's error boundary cannot display a meaningful message either.
  const fetchClientSecret = (): Promise<string> => (
    Promise.resolve(checkoutSessionClientSecret).catch((err: unknown) => {
      let message: string;
      if (err instanceof Error) {
        message = err.message;
      } else if (typeof err === 'string') {
        message = err;
      } else {
        message = JSON.stringify(err);
      }
      throw new Error(`Stripe session initialization failed: ${message}`);
    })
  );

  return (
    <CheckoutProvider
      key={checkoutSessionClientSecret}
      stripe={stripePromise}
      options={{
        fetchClientSecret,
        elementsOptions: { appearance },
      }}
    >
      {children}
    </CheckoutProvider>
  );
};

export default StripeProvider;
