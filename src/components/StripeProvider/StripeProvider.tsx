import { getConfig } from '@edx/frontend-platform/config';
import { CheckoutProvider } from '@stripe/react-stripe-js';
import { Appearance, loadStripe } from '@stripe/stripe-js';
import { ReactNode, useCallback, useMemo } from 'react';

import { useCheckoutSessionClientSecret } from '@/components/app/data';
import { createStripeAppearance } from '@/components/StripeProvider/utils';

type StripeProviderProps = {
  children: ReactNode;
};

const StripeProvider = ({ children }: StripeProviderProps) => {
  const { PUBLISHABLE_STRIPE_API_KEY } = getConfig();
  const stripePromise = useMemo(() => loadStripe(PUBLISHABLE_STRIPE_API_KEY), [PUBLISHABLE_STRIPE_API_KEY]);
  const appearance: Appearance = useMemo(() => createStripeAppearance(), []);
  const elementsOptions = useMemo(() => ({ appearance }), [appearance]);
  const checkoutSessionClientSecret = useCheckoutSessionClientSecret();

  const fetchClientSecret = useCallback(
    () => Promise.resolve(checkoutSessionClientSecret!),
    [checkoutSessionClientSecret],
  );
  const checkoutOptions = useMemo(() => ({
    fetchClientSecret,
    elementsOptions,
  }), [fetchClientSecret, elementsOptions]);

  if (!checkoutSessionClientSecret) {
    return null;
  }

  return (
    <CheckoutProvider
      key={checkoutSessionClientSecret}
      stripe={stripePromise}
      options={checkoutOptions}
    >
      {children}
    </CheckoutProvider>
  );
};

export default StripeProvider;
