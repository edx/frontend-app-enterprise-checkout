import { defineMessages } from '@edx/frontend-platform/i18n';
import { z } from 'zod';

import { validateRegistrationFieldsDebounced } from '@/components/app/data/services/registration';
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
  companyName: 'existing_enterprise_customer';
};

export const CheckoutErrorMessagesByField: { [K in keyof FieldErrorCodes]: Record<FieldErrorCodes[K], string> } = {
  adminEmail: {
    invalid_format: 'Invalid format for given email address.',
    not_registered: 'Given email address does not correspond to an existing user.',
    incomplete_data: 'Not enough parameters were given.',
  },
  enterpriseSlug: {
    invalid_format: 'Only alphanumeric lowercase characters and hyphens are allowed.',
    // EXISTING_ENTERPRISE_CUSTOMER_FOR_ADMIN uses the same error code on the backend
    existing_enterprise_customer: 'URL is already in use.',
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
  companyName: {
    existing_enterprise_customer: 'This company already has an edX account. Please contact support to request access or modify the existing account',
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

export const PlanDetailsRegisterPageSchema = (constraints: CheckoutContextFieldConstraints) => (z.object({
  adminEmail: z.string().trim()
    .email()
    .min(
      constraints?.adminEmail?.minLength ?? 6,
      'Email is required',
    )
    .max(constraints?.adminEmail?.maxLength ?? 253),
  fullName: z.string().trim()
    .min(
      constraints?.fullName?.minLength ?? 1,
      'Full name is required',
    )
    .max(constraints?.fullName?.maxLength ?? 150),
  username: z.string().trim()
    .min(2, 'Username must be between 2 and 30 characters long.')
    .max(30, 'Username must be between 2 and 30 characters long.'),
  password: z.string()
    .min(8, 'Password must contain at least 8 characters.')
    .max(100, 'Password must contain no more than 100 characters.')
    .refine((value) => /[0-9]/.test(value), 'Password must contain at least one digit.'),
  confirmPassword: z.string(),
  country: z.string().trim()
    .min(1, 'Country is required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
}).superRefine(async (data, ctx) => {
  const { isValid, errors } = await validateRegistrationFieldsDebounced({
    email: data.adminEmail,
    name: data.fullName,
    username: data.username,
    password: data.password,
    country: data.country,
  });
  if (!isValid) {
    // Map LMS errors back to Zod issues
    Object.entries(errors).forEach(([field, message]) => {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message,
        path: field === 'root' ? [] : [field],
      });
    });
  }
}));

export const PlanDetailsSchema = (
  constraints: CheckoutContextFieldConstraints,
  stripePriceId: CheckoutContextPrice['id'],
) => (z.object({
  quantity: z.coerce.number()
    .min(
      1,
      'Number of licenses is required',
    )
    .min(
      constraints?.quantity?.min ?? 5,
      `Must be at least ${constraints?.quantity?.min ?? 5} licenses`,
    )
    .max(
      constraints?.quantity?.max ?? 50,
      `You can only have up to ${constraints?.quantity?.max ?? 50} licenses on the Teams plan. Either decrease the number of licenses or choose a different plan.`,
    )
    .superRefine(async (quantity, ctx) => {
      const { isValid, validationDecisions } = await validateFieldDetailed(
        'quantity',
        quantity,
        { stripePriceId, adminEmail: '' },
      );
      if (!isValid && validationDecisions?.quantity) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: serverValidationError('quantity', validationDecisions, CheckoutErrorMessagesByField),
        });
      }
    }),
  fullName: z.string().trim()
    .min(
      constraints?.fullName?.minLength ?? 1,
      'Full name is required',
    )
    .max(
      constraints?.fullName?.maxLength ?? 150,
      `Name is too long. It must contain no more than ${constraints?.fullName?.maxLength ?? 150} characters.`,
    ),
  adminEmail: z.string().trim()
    .min(
      1,
      'Work email is required',
    )
    .min(
      constraints?.adminEmail?.minLength ?? 6,
      'Please enter valid email (too short)',
    )
    .max(
      constraints?.adminEmail?.maxLength ?? 253,
      `This email address is too long. It must contain no more than ${constraints?.adminEmail?.maxLength ?? 253} characters`,
    )
    .regex(
      new RegExp(constraints?.adminEmail?.pattern ?? '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$'),
      'Please enter valid email',
    )
    .email()
    .superRefine(async (adminEmail, ctx) => {
      // TODO: Nice to have to avoid calling this API if client side validation catches first
      const { isValid, validationDecisions } = await validateFieldDetailed(
        'adminEmail',
        adminEmail,
      );
      if (!isValid && validationDecisions?.adminEmail) {
        // Check if the validation error is 'not_registered'
        const adminEmailDecision = validationDecisions?.adminEmail;
        if (adminEmailDecision.errorCode !== 'not_registered') {
          // Only throw validation error for other error codes, not 'not_registered'
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: serverValidationError('adminEmail', validationDecisions, CheckoutErrorMessagesByField),
          });
        }
        // For 'not_registered', we allow the form to submit and handle navigation in the submit callback
      }
    }),
  country: z.string().trim()
    .min(
      constraints?.country?.minLength ?? 2,
      'Country is required',
    ),
  stripePriceId: z.string().trim().optional().nullable(),
}));

export const AccountDetailsSchema = (
  constraints: CheckoutContextFieldConstraints,
  adminEmail?: string,
) => (z.object({
  companyName: z.string().trim()
    .min(
      constraints?.companyName?.minLength ?? 1,
      'Company name is required',
    )
    .max(
      constraints?.companyName?.maxLength ?? 255,
      `Maximum ${constraints?.companyName?.maxLength ?? 255} characters`,
    )
    .superRefine(async (companyName, ctx) => {
      const { isValid, validationDecisions } = await validateFieldDetailed(
        'companyName',
        companyName,
      );
      if (!isValid && validationDecisions?.companyName) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: serverValidationError('companyName', validationDecisions, CheckoutErrorMessagesByField),
        });
      }
    }),
  enterpriseSlug: z.string().trim()
    .min(
      constraints?.enterpriseSlug?.minLength ?? 1,
      'Company Url is required',
    )
    .max(
      constraints?.enterpriseSlug?.maxLength ?? 255,
      `Maximum ${constraints?.enterpriseSlug?.maxLength ?? 255} characters`,
    )
    .regex(
      new RegExp(constraints?.enterpriseSlug?.pattern ?? '^[a-z0-9-]+$'),
      'Only alphanumeric lowercase characters and hyphens are allowed.',
    )
    .superRefine(async (enterpriseSlug, ctx) => {
      const { isValid, validationDecisions } = await validateFieldDetailed(
        'enterpriseSlug',
        enterpriseSlug,
        { adminEmail: adminEmail || '' },
      );
      if (!isValid && validationDecisions?.enterpriseSlug) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: serverValidationError('enterpriseSlug', validationDecisions, CheckoutErrorMessagesByField),
        });
      }
    }),
}));

// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const BillingDetailsSchema = (constraints: CheckoutContextFieldConstraints) => (
  z.object({
    confirmTnC: z.boolean().refine((value) => value, {
      message: 'Please accept the terms.',
    }),
    confirmSubscription: z.boolean().refine((value) => value, {
      message: 'Please confirm organization subscription.',
    }),
  })
);

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
      defaultMessage: 'Subscribe',
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
