import { AddressElement, PaymentElement } from '@stripe/react-stripe-js';

import { StripeProvider } from '@/components/StripeProvider';

const StripeFormFields = () => (
  <StripeProvider>
    <AddressElement
      options={{
        mode: 'billing',
      }}
    />
    <PaymentElement />
  </StripeProvider>
);

// @ts-ignore
export default StripeFormFields;
