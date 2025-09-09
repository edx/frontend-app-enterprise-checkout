import { useCheckoutFormStore } from '@/hooks/useCheckoutFormStore';

const useCheckoutSessionClientSecret = () => {
  const checkoutSessionClientSecret = useCheckoutFormStore((state) => state.checkoutSessionClientSecret);
  return checkoutSessionClientSecret;
};

export default useCheckoutSessionClientSecret;
