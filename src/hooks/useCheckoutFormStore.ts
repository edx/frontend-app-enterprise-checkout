import { create } from 'zustand';

const useCheckoutFormStore = create<FormStore>(
  (set) => ({
    formData: {
      planDetails: {},
      accountDetails: {},
      billingDetails: {},
      // TODO: This is added an a means to iterate through the project. Will need to be removed.
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
