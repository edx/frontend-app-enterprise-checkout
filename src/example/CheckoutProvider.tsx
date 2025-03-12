import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { create } from 'zustand';
import { persist, StateStorage, createJSONStorage } from 'zustand/middleware'
import { z } from 'zod';

export const steps = [
  'plan',
  'organization',
  'billing',
] as const;
type Step = typeof steps[number];

export const Step1Schema = z.object({
  numUsers: z.coerce.number().min(5).max(500),
  planType: z.enum(['annual', 'quarterly']),
});
export const Step2Schema = z.object({
  fullName: z.string().nonempty().max(255),
  orgEmail: z.string().email().min(3).max(254),
  orgName: z.string().nonempty().max(255),
  country: z.string().nonempty(),
});

export type Step1Data = z.infer<typeof Step1Schema>;
export type Step2Data = z.infer<typeof Step2Schema>;

type FormData = {
  plan: Partial<Step1Data>;
  organization: Partial<Step2Data>;
  billing: Record<string, unknown>;
}

type FormStore = {
  formData: Partial<FormData>;
  setFormData: (step: Step, data: Partial<Step1Data & Step2Data>) => void;
  currentStep: Step;
  setCurrentStep: (step: Step) => void;
  handleNext: () => void;
  handlePrevious: () => void;
};

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
    console.log(`Setting ${key} to ${newValue}`);
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

export const useFormStore = create(
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

interface CheckoutProviderProps {
  children: React.ReactNode;
}

const CheckoutProvider: React.FC<CheckoutProviderProps> = ({ children }) => {
  return children;
};

export default CheckoutProvider;
