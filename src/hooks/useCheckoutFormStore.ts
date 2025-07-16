import { create } from 'zustand';

const useCheckoutFormStore = create<FormStore>(
  (set) => ({
    formData: {
      buildTrial: {},
      createAccount: {},
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
