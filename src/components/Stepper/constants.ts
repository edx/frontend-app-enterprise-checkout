// Import and re-export constants from the shared module
import {
  AccountDetailsSchema,
  BillingDetailsSchema,
  CheckoutPageDetails,
  CheckoutStepByKey,
  CheckoutStepKey,
  CheckoutSubstepByKey,
  CheckoutSubstepKey,
  PlanDetailsSchema,
  SUBSCRIPTION_PRICE_PER_USER_PER_MONTH,
} from '@/constants/checkout';

// Constants specific to the Stepper component
export const authenticatedSteps = [
  'account-details',
  'billing-details',
] as const;

export enum DataStores {
  PlanDetailsStoreKey = 'PlanDetails',
  AccountDetailsStoreKey = 'AccountDetails',
  BillingDetailsStoreKey = 'BillingDetails',
}

export enum SubmitCallbacks {
  PlanDetailsCallback = 'PlanDetails',
  PlanDetailsLoginCallback = 'PlanDetailsLogin',
  PlanDetailsRegisterCallback = 'PlanDetailsRegister',
}

// Re-export constants from the shared module
export {
  AccountDetailsSchema,
  BillingDetailsSchema,
  CheckoutPageDetails,
  CheckoutStepByKey,
  CheckoutStepKey,
  CheckoutSubstepByKey,
  CheckoutSubstepKey,
  PlanDetailsSchema,
  SUBSCRIPTION_PRICE_PER_USER_PER_MONTH,
};
