import { useCheckoutFormStore } from '@/hooks/useCheckoutFormStore';

const useCheckoutSessionClientSecret = () => useCheckoutFormStore((state) => state.checkoutSessionClientSecret);

export default useCheckoutSessionClientSecret;
