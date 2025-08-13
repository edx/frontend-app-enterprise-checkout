import { create } from 'zustand';

const useCheckoutFormStore = create<FormStore>(
  (set) => ({
    formData: {
      PlanDetails: {},
      AccountDetails: {},
      BillingDetails: {},
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
