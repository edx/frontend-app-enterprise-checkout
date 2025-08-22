import { defineMessages } from '@edx/frontend-platform/i18n';
import { z } from 'zod';

import { validateFieldDetailed } from '@/components/app/data/services/validation';
import { serverValidationError } from '@/utils/common';

export enum CheckoutStepKey {
  PlanDetails = 'plan-details',
  AccountDetails = 'account-details',
  BillingDetails = 'billing-details',
}

export enum CheckoutSubstepKey {
  Login = 'login',
  Register = 'register',
  Success = 'success',
}

function reverseEnum<E extends Record<string, string>>(enumObj: E): Record<E[keyof E], keyof E> {
  return Object.fromEntries(
    Object.entries(enumObj).map(([key, value]) => [value, key]),
  ) as Record<E[keyof E], keyof E>;
}

export const CheckoutStepByKey: Record<CheckoutStepKey, CheckoutStep> = reverseEnum(CheckoutStepKey);
export const CheckoutSubstepByKey: Record<CheckoutSubstepKey, CheckoutSubstep> = reverseEnum(CheckoutSubstepKey);

export type FieldErrorCodes = {
  adminEmail: 'invalid_format' | 'not_registered' | 'incomplete_data';
  enterpriseSlug: 'invalid_format' | 'existing_enterprise_customer' | 'slug_reserved' | 'incomplete_data';
  quantity: 'invalid_format' | 'range_exceeded' | 'incomplete_data';
  stripePriceId: 'invalid_format' | 'does_not_exist' | 'incomplete_data';
};

export const CheckoutErrorMessagesByField: { [K in keyof FieldErrorCodes]: Record<FieldErrorCodes[K], string> } = {
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

// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const PlanDetailsLoginPageSchema = (constraints: CheckoutContextFieldConstraints) => (z.object({
  adminEmail: z.string().trim()
    .email()
    .max(254)
    .optional(),
  password: z.string().trim()
    .min(2, 'Password is required')
    .max(255, 'Maximum 255 characters'),
}));

// TODO: complete as part of ticket to do register page.
export const PlanDetailsRegisterPageSchema = () => (z.object({}));

export const PlanDetailsSchema = (
  constraints: CheckoutContextFieldConstraints,
  stripePriceId: CheckoutContextPrice['id'],
) => (z.object({
  quantity: z.coerce.number()
    .min(
      constraints?.quantity?.min,
      constraints?.quantity?.min
        ? `Minimum ${constraints.quantity.min} users`
        : undefined,
    )
    .max(
      constraints?.quantity?.max,
      constraints?.quantity?.max
        ? `Maximum ${constraints.quantity.max} users`
        : undefined,
    )
    .superRefine(async (quantity, ctx) => {
    // TODO: Nice to have to avoid calling this API if client side validation catches first
      const { isValid, validationDecisions } = await validateFieldDetailed(
        'quantity',
        quantity,
        { stripePriceId },
      );
      if (!isValid) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: serverValidationError('quantity', validationDecisions, CheckoutErrorMessagesByField),
        });
      }
    }),
  fullName: z.string().trim()
    .min(1, 'Full name is required')
    .max(255),
  adminEmail: z.string().trim()
    .max(254),
  country: z.string().trim()
    .min(1, 'Country is required'),
  stripePriceId: z.string().trim().optional().nullable(),
}));

export const AccountDetailsSchema = (constraints: CheckoutContextFieldConstraints) => (z.object({
  companyName: z.string().trim()
    .min(1, 'Company name is required')
    .max(255, 'Maximum 255 characters'),
  enterpriseSlug: z.string().trim()
    .min(
      constraints?.enterpriseSlug?.minLength,
      'Company Url is required',
    )
    .max(
      constraints?.enterpriseSlug?.maxLength,
      constraints?.enterpriseSlug?.maxLength
        ? `Maximum ${constraints?.enterpriseSlug.maxLength} characters`
        : undefined,
    )
    .regex(
      new RegExp(constraints?.enterpriseSlug?.pattern),
      'Only lowercase letters, numbers, and hyphens allowed',
    ),
}));

// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const BillingDetailsSchema = (constraints: CheckoutContextFieldConstraints) => (z.object({}));

export const CheckoutPageRoute = {
  PlanDetails: `/${CheckoutStepKey.PlanDetails}`,
  PlanDetailsLogin: `/${CheckoutStepKey.PlanDetails}/${CheckoutSubstepKey.Login}`,
  PlanDetailsRegister: `/${CheckoutStepKey.PlanDetails}/${CheckoutSubstepKey.Register}`,
  AccountDetails: `/${CheckoutStepKey.AccountDetails}`,
  BillingDetails: `/${CheckoutStepKey.BillingDetails}`,
  BillingDetailsSuccess: `/${CheckoutStepKey.BillingDetails}/${CheckoutSubstepKey.Success}`,
} as const;

export const CheckoutPageDetails: { [K in CheckoutPage]: CheckoutPageDetails } = {
  PlanDetails: {
    step: 'PlanDetails',
    substep: undefined,
    formSchema: PlanDetailsSchema,
    route: CheckoutPageRoute.PlanDetails,
    title: defineMessages({
      id: 'checkout.planDetails.title',
      defaultMessage: 'Plan Details',
      description: 'Title for the plan details page',
    }),
    buttonMessage: defineMessages({
      id: 'checkout.planDetails.continue',
      defaultMessage: 'Continue',
      description: 'Button label for the next step in the plan details step',
    }),
  },
  PlanDetailsLogin: {
    step: 'PlanDetails',
    substep: 'Login',
    formSchema: PlanDetailsLoginPageSchema,
    route: CheckoutPageRoute.PlanDetailsLogin,
    title: defineMessages({
      id: 'checkout.planDetailsLogin.title',
      defaultMessage: 'Log in to your account',
      description: 'Title for the login page in the plan details step',
    }),
    buttonMessage: defineMessages({
      id: 'checkout.registrationPage.login',
      defaultMessage: 'Sign in',
      description: 'Button label to login a user in the plan details step',
    }),
  },
  PlanDetailsRegister: {
    step: 'PlanDetails',
    substep: 'Register',
    formSchema: PlanDetailsRegisterPageSchema,
    route: CheckoutPageRoute.PlanDetailsRegister,
    title: defineMessages({
      id: 'checkout.planDetailsRegistration.title',
      defaultMessage: 'Create your Account',
      description: 'Title for the registration page in the plan details step',
    }),
    buttonMessage: defineMessages({
      id: 'checkout.registrationPage.register',
      defaultMessage: 'Register',
      description: 'Button label to register a new user in the plan details step',
    }),
  },
  AccountDetails: {
    step: 'AccountDetails',
    substep: undefined,
    formSchema: AccountDetailsSchema,
    route: CheckoutPageRoute.AccountDetails,
    title: defineMessages({
      id: 'checkout.accountDetails.title',
      defaultMessage: 'Account Details',
      description: 'Title for the account details step',
    }),
    buttonMessage: defineMessages({
      id: 'checkout.accountDetails.continue',
      defaultMessage: 'Continue',
      description: 'Button to go to the next page',
    }),
  },
  BillingDetails: {
    step: 'BillingDetails',
    substep: undefined,
    formSchema: BillingDetailsSchema,
    route: CheckoutPageRoute.BillingDetails,
    title: defineMessages({
      id: 'checkout.billingDetails.title',
      defaultMessage: 'Billing Details',
      description: 'Title for the billing details step',
    }),
    buttonMessage: defineMessages({
      id: 'checkout.billingDetails.purchaseNow',
      defaultMessage: 'Purchase Now',
      description: 'Button to purchase the subscription product',
    }),
  },
  BillingDetailsSuccess: {
    step: 'BillingDetails',
    substep: 'Success',
    formSchema: BillingDetailsSchema,
    route: CheckoutPageRoute.BillingDetailsSuccess,
    title: defineMessages({
      id: 'checkout.billingDetailsSuccess.title',
      defaultMessage: 'Thank you, {firstName}.',
      description: 'Title for the success page',
    }),
    buttonMessage: null,
  },
};

// TODO: these should be fetched from the Stripe, likely via
// an exposed REST API endpoint on the server.
export const SUBSCRIPTION_PRICE_PER_USER_PER_MONTH = 33;

// Constants specific to the Stepper component
export const authenticatedSteps = [
  'account-details',
  'billing-details',
] as const;

export enum DataStoreKey {
  PlanDetails = 'PlanDetails',
  AccountDetails = 'AccountDetails',
  BillingDetails = 'BillingDetails',
}

export enum SubmitCallbacks {
  PlanDetails = 'PlanDetails',
  PlanDetailsLogin = 'PlanDetailsLogin',
  PlanDetailsRegister = 'PlanDetailsRegister',
}
