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
    // TODO: This is added an a means to iterate through the project. Will need to be removed.
    isAuthenticated: false,
    setIsAuthenticated: (newIsAuthenticated) => set(
      (store) => ({
        ...store,
        isAuthenticated: newIsAuthenticated,
      }),
    ),
  }),
);

export default useCheckoutFormStore;
