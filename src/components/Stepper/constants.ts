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

const CheckoutErrorMessagesByField = {
  adminEmail: {
    invalid_format: 'Invalid format for given email address.',
    not_registered: 'Given email address does not correspond to an existing user.',
    incomplete_data: 'Not enough parameters were given.',
  },
  enterpriseSlug: {
    invalid_format: 'Invalid format for given slug.',
    // EXISTING_ENTERPRISE_CUSTOMER_FOR_ADMIN uses the same error code on the backend
    existing_enterprise_customer: 'The slug conflicts with an existing customer.',
    slug_reserved: 'The slug is currently reserved by another user.',
    incomplete_data: 'Not enough parameters were given.',
  },
  quantity: {
    invalid_format: 'Must be a positive integer.',
    range_exceeded: 'Exceeded allowed range for given stripe_price_id.',
    incomplete_data: 'Not enough parameters were given.',
  },
  stripePriceId: {
    invalid_format: 'Must be a non-empty string.',
    does_not_exist: 'This stripe_price_id has not been configured.',
    incomplete_data: 'Not enough parameters were given.',
  },
};

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
  CheckoutErrorMessagesByField,
};
