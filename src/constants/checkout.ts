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

export enum CheckoutStepperPath {
  PlanDetailsRoute = '/plan-details',
  LoginRoute = '/plan-details/login',
  RegisterRoute = '/plan-details/register',
  AccountDetailsRoute = '/account-details',
  BillingDetailsRoute = '/billing-details',
  SuccessRoute = '/billing-details/success',
}

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

export const PlanDetailsRegistrationSchema = z.object({
  authenticated: z.boolean().optional(),
});

export const PlanDetailsLoginSchema = z.object({
  authenticated: z.boolean().optional(),
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
