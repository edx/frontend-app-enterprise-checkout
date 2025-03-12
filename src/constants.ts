import { z } from 'zod';

export const steps = [
  'plan',
  'organization',
  'billing',
] as const;

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
