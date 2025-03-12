import { create } from 'zustand';
import { persist, StateStorage, createJSONStorage } from 'zustand/middleware';

import { steps } from '@/constants';

const getUrlSearch = () => {
  return window.location.search.slice(1)
}

const persistentStorage: StateStorage = {
  getItem: (key): string => {
    // Check URL first
    if (getUrlSearch()) {
      const searchParams = new URLSearchParams(getUrlSearch())
      const storedValue = searchParams.get(key)
      return JSON.parse(storedValue as string)
    } else {
      // Otherwise, we should load from localstorage or alternative storage
      return JSON.parse(localStorage.getItem(key) as string)
    }
  },
  setItem: (key, newValue): void => {
    const searchParams = new URLSearchParams(getUrlSearch())
    searchParams.set(key, JSON.stringify(newValue))
    window.history.replaceState(null, '', `?${searchParams.toString()}`)
    localStorage.setItem(key, JSON.stringify(newValue))
  },
  removeItem: (key): void => {
    const searchParams = new URLSearchParams(getUrlSearch())
    searchParams.delete(key)
    window.location.search = searchParams.toString()
    localStorage.removeItem(key)
  },
}

const storageOptions = {
  name: 'store',
  storage: createJSONStorage<FormStore>(() => persistentStorage),
}

const useCheckoutFormStore = create(
  persist<FormStore>(
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
    storageOptions,
  ),
);

export default useCheckoutFormStore;
