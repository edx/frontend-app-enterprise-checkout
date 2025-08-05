import { defineMessages } from '@edx/frontend-platform/i18n';
import { z } from 'zod';

import { validateQuantity } from '@/components/app/data/services/validation';

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

export const CheckoutPageDetails: { [K in CheckoutPage]: CheckoutPageDetails } = {
  PlanDetails: {
    step: 'PlanDetails',
    substep: undefined,
    route: `/${CheckoutStepKey.PlanDetails}`,
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
  } as CheckoutPageDetails,
  PlanDetailsLogin: {
    step: 'PlanDetails',
    substep: 'Login',
    route: `/${CheckoutStepKey.PlanDetails}/${CheckoutSubstepKey.Login}`,
    title: defineMessages({
      id: 'checkout.planDetailsLogin.title',
      defaultMessage: 'Log in to your account',
      description: 'Title for the login page in the plan details step',
    }),
    buttonMessage: defineMessages({
      id: 'checkout.registrationPage.login',
      defaultMessage: 'Log in',
      description: 'Button label to login a user in the plan details step',
    }),
  },
  PlanDetailsRegister: {
    step: 'PlanDetails',
    substep: 'Register',
    route: `/${CheckoutStepKey.PlanDetails}/${CheckoutSubstepKey.Register}`,
    title: defineMessages({
      id: 'checkout.planDetailsRegistration.title',
      defaultMessage: 'Create your Account',
      description: 'Title for the registration page in the plan details step',
    }),
    buttonMessage: defineMessages({
      id: 'checkout.registrationPage.register',
      defaultMessage: 'Sign up',
      description: 'Button label to register a new user in the plan details step',
    }),
  },
  AccountDetails: {
    step: 'AccountDetails',
    substep: undefined,
    route: `/${CheckoutStepKey.AccountDetails}`,
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
    route: `/${CheckoutStepKey.BillingDetails}`,
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
    route: `/${CheckoutStepKey.BillingDetails}/${CheckoutSubstepKey.Success}`,
    title: defineMessages({
      id: 'checkout.billingDetailsSuccess.title',
      defaultMessage: 'Thank you, {firstName}.',
      description: 'Title for the success page',
    }),
    buttonMessage: null,
  },
};

export const PlanDetailsSchema = z.object({
  quantity: z.coerce.number()
    .min(5, 'Minimum 5 users')
    .max(500, 'Maximum 500 users')
    .refine(async (numUsers) => {
      const response = await validateQuantity(numUsers);
      console.log(response);
      return response;
    }, {
      message: 'Failed server-side validation.',
    }),
  // .refine(async (numUsers) => {
  //   try {
  //     const response = await fetchCheckoutValidation({
  //       ...snakeCaseObject(baseValidation),
  //       quantity: numUsers,
  //       stripe_price_id: 'price_9876_replace-me',
  //     });
  //     console.log(response);
  //     return true;
  //   } catch (e) {
  //     console.error(e);
  //   }
  //   return false;
  // }),
  authenticated: z.boolean().optional(),
  // fullName: z.string().trim()
  //   .min(1, 'Full name is required')
  //   .max(255)
  //   .optional(),
  // orgEmail: z.string().trim()
  //   .email()
  //   .max(254)
  //   .optional(),
  // orgName: z.string().trim()
  //   .min(1, 'Organization name is required')
  //   .max(255, 'Maximum 255 characters')
  //   .optional(),
  // country: z.string().trim()
  //   .min(1, 'Country is required').optional(),
});

export const AccountDetailsSchema = z.object({
  orgSlug: z.string().trim()
    .min(1, 'Access link is required')
    .max(30, 'Maximum 30 characters')
    .regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens allowed')
    .refine(slug => !slug.startsWith('-') && !slug.endsWith('-'), {
      message: 'Access link may not start or end with a hyphen',
    })
    .optional(),
});

export const BillingDetailsSchema = z.object({});

// TODO: these should be fetched from the Stripe, likely via
// an exposed REST API endpoint on the server.
export const SUBSCRIPTION_PRICE_PER_USER_PER_MONTH = 33;
