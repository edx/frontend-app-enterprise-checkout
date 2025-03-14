import { create } from 'zustand';

import { steps } from '@/constants';

const useCheckoutFormStore = create<FormStore>(
  (set) => ({
    formData: {
      plan: {},
      organization: {},
      billing: {},
    },
    setFormData: (step, data) => set((store) => ({ formData: { ...store.formData, [step]: data } })),
    currentStep: steps[0],
    setCurrentStep: (step) => set(() => ({ currentStep: step })),
    handleNext: () => set((state) => {
      const currentIndex = steps.indexOf(state.currentStep);
      const nextIndex = Math.min(currentIndex + 1, steps.length - 1); // Ensure it doesn't go beyond the last step
      return { currentStep: steps[nextIndex] };
    }),
    handlePrevious: () => set((state) => {
      const currentIndex = steps.indexOf(state.currentStep);
      const prevIndex = Math.max(currentIndex - 1, 0); // Ensure it doesn't go below the first step
      return { currentStep: steps[prevIndex] };
    }),
  }),
);

export default useCheckoutFormStore;
