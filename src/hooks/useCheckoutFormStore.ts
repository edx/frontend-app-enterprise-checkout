import { create } from 'zustand';

import { CheckoutStepKey } from '@/components/Stepper/constants';

const useCheckoutFormStore = create<FormStore>(
  (set) => ({
    formData: {
      [CheckoutStepKey.PlanDetails]: {},
      [CheckoutStepKey.AccountDetails]: {},
      [CheckoutStepKey.BillingDetails]: {},
      planDetailsLogin: {},
      planDetailsRegistration: {},
    },
    setFormData: (step, data) => set(
      (store) => ({
        formData: {
          ...store.formData,
          [step]: data,
        },
      }),
    ),
  }),
);

export default useCheckoutFormStore;
