import { create } from 'zustand';

import { DataStoreKey } from '@/constants/checkout';

/**
 * Zustand store used to hold and mutate the multistep checkout form data.
 *
 * Shape:
 * - formData: keyed by DataStoreKey to avoid hard-coded strings.
 * - setFormData(step, data): replaces the data for the given step key.
 */
export const useCheckoutFormStore = create<FormStore>(
  (set) => ({
    /** Container for form values keyed by step. */
    formData: {
      [DataStoreKey.PlanDetails]: {},
      [DataStoreKey.AccountDetails]: {},
      [DataStoreKey.BillingDetails]: {},
    },
    /**
     * Replace the current data for a given step.
     *
     * Note: This intentionally replaces the step payload as provided by callers,
     * rather than deep-merging.
     *
     * @param {DataStoreKey} step - The step key from DataStoreKey enum.
     * @param {unknown} data - The new data payload for the step.
     */
    setFormData: (step, data) => set(
      (store) => ({
        ...store,
        formData: {
          ...store.formData,
          [step]: data,
        },
      }),
    ),
    /* Place to memorize the checkout session client secret. */
    checkoutSessionClientSecret: undefined,
    checkoutSessionStatus: {
      type: null,
      paymentStatus: null,
    },
    setCheckoutSessionClientSecret: (secret) => set(
      (store) => ({
        ...store,
        checkoutSessionClientSecret: secret,
      }),
    ),
    setCheckoutSessionStatus: (status) => set(
      (store) => ({
        ...store,
        checkoutSessionStatus: status,
      }),
    ),
  }),
);

/**
 * Direct reference to the store for imperative usage (e.g., setState outside React).
 */
export const checkoutFormStore = useCheckoutFormStore;
