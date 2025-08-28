import { snakeCaseObject } from '@edx/frontend-platform';

const baseValidation: ValidationSchema = {
  adminEmail: '',
  companyName: '',
  enterpriseSlug: '',
  stripePriceId: 'price_9876_replace-me',
  quantity: 0,
  fullName: '',
};

const snakeCaseBaseValidation: ValidationSchemaPayload = snakeCaseObject(baseValidation);

const baseCreateCheckoutSession: CreateCheckoutSessionSchema = {
  adminEmail: '',
  companyName: '',
  enterpriseSlug: '',
  quantity: 0,
  stripePriceId: '',
};

const snakeCaseBaseCreateCheckoutSession: CreateCheckoutSessionSchemaPayload = snakeCaseObject(
  baseCreateCheckoutSession,
);

const VALIDATION_DEBOUNCE_MS = 500;

export {
  baseValidation,
  baseCreateCheckoutSession,
  snakeCaseBaseValidation,
  snakeCaseBaseCreateCheckoutSession,
  VALIDATION_DEBOUNCE_MS,
};
