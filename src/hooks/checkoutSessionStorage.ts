import { logError } from '@edx/frontend-platform/logging';
import { create } from 'zustand';
import { createJSONStorage, persist, StateStorage } from 'zustand/middleware';

/**
 * Wraps sessionStorage so a thrown access (private browsing, quota exceeded) is logged and
 * degrades safely, instead of every persisted store re-implementing its own try/catch.
 *
 * zustand's persist middleware hydrates synchronously whenever storage.getItem returns a plain
 * value (not a Promise) — these methods are deliberately synchronous so each store below reflects
 * sessionStorage's real value immediately on creation, not after a deferred microtask.
 */
const safeSessionStorage: StateStorage = {
  getItem: (name) => {
    try {
      return sessionStorage.getItem(name);
    } catch (error) {
      logError(`Failed to read sessionStorage key ${name}`, error);
      return null;
    }
  },
  setItem: (name, value) => {
    try {
      sessionStorage.setItem(name, value);
    } catch (error) {
      logError(`Failed to write sessionStorage key ${name}`, error);
    }
  },
  removeItem: (name) => {
    try {
      sessionStorage.removeItem(name);
    } catch (error) {
      logError(`Failed to remove sessionStorage key ${name}`, error);
    }
  },
};

/** Shared factory so each checkout-session-scoped persisted store only declares its own shape. */
const createPersistedCheckoutStore = <T>(name: string, initializer: Parameters<typeof persist<T>>[0]) => create<T>()(
  persist(initializer, {
    name,
    storage: createJSONStorage(() => safeSessionStorage),
  }),
);

interface CheckoutStartedState {
  started: boolean;
  /** True only on the first call in a browser session, so checkout_started fires once. */
  claimStarted: () => boolean;
}

/** Persisted under 'edx.checkout.started' — same key name the app already used. */
export const useCheckoutStartedStore = createPersistedCheckoutStore<CheckoutStartedState>(
  'edx.checkout.started',
  (set, get) => ({
    started: false,
    claimStarted: () => {
      if (get().started) {
        return false;
      }
      set({ started: true });
      return true;
    },
  }),
);

export type CheckoutAttributionProperties = Partial<Record<
'utm_source' | 'utm_medium' | 'utm_campaign' | 'utm_content' | 'utm_term' | 'referrer',
string
>>;

interface CheckoutAttributionState {
  attribution: CheckoutAttributionProperties;
  /** Distinct from `attribution` being non-empty — a landing with no UTMs/referrer still "captures". */
  captured: boolean;
  setAttribution: (attribution: CheckoutAttributionProperties) => void;
}

/** Persisted under 'edx.checkout.attribution' — same key name the app already used. */
export const useCheckoutAttributionStore = createPersistedCheckoutStore<CheckoutAttributionState>(
  'edx.checkout.attribution',
  (set) => ({
    attribution: {},
    captured: false,
    setAttribution: (attribution) => set({ attribution, captured: true }),
  }),
);
