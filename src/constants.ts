import { z } from 'zod';

export const steps = [
  'plan',
  'account',
] as const;

export const planTypes = [
  'annual',
  'quarterly',
] as const;

export const PlanSchema = z.object({
  numUsers: z.coerce.number()
    .min(5, 'Minimum 5 users')
    .max(500, 'Maximum 500 users'),
  planType: z.enum(planTypes),
});

export const AccountSchema = z.object({
  fullName: z.string().trim()
    .min(1, 'Full name is required')
    .max(255),
  orgEmail: z.string().trim()
    .email()
    .max(254),
  orgName: z.string().trim()
    .min(1, 'Organization name is required')
    .max(255, 'Maximum 255 characters'),
  orgSlug: z.string().trim()
    .min(1, 'Access link is required')
    .max(30, 'Maximum 30 characters')
    .regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens allowed')
    .refine(slug => !slug.startsWith('-') && !slug.endsWith('-'), {
      message: 'Access link may not start or end with a hyphen',
    }),
  country: z.string().trim()
    .min(1, 'Country is required'),
});

// TODO: these should be fetched from the Stripe, likely via
// an exposed REST API endpoint on the server.
export const SUBSCRIPTION_ANNUAL_PRICE_PER_USER = 394;
