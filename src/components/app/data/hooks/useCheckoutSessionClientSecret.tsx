import { useEffect } from 'react';

import { useCheckoutFormStore } from '@/hooks/useCheckoutFormStore';

import useCheckoutIntent from './useCheckoutIntent';

const useCheckoutSessionClientSecret = (): string | null => {
  const { data: checkoutIntent } = useCheckoutIntent();
  const storedSecret = useCheckoutFormStore((state) => state.checkoutSessionClientSecret ?? null);
  const setStoredSecret = useCheckoutFormStore((state) => state.setCheckoutSessionClientSecret);

  const latestSecret = checkoutIntent?.checkoutSessionClientSecret ?? null;

  useEffect(() => {
    if (!!latestSecret && latestSecret !== storedSecret) {
      setStoredSecret(latestSecret);
    }
  }, [latestSecret, setStoredSecret, storedSecret]);

  return latestSecret ?? storedSecret ?? null;
};

export default useCheckoutSessionClientSecret;
