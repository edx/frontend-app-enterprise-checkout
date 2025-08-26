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

const baseCheckoutSession: CheckoutSessionSchema = {
  adminEmail: '',
  companyName: '',
  enterpriseSlug: '',
  quantity: 0,
  stripePriceId: '',
};

const snakeCaseBaseCheckoutSession: CheckoutSessionSchemaPayload = snakeCaseObject(baseCheckoutSession);

const VALIDATION_DEBOUNCE_MS = 500;

export {
  baseValidation,
  baseCheckoutSession,
  snakeCaseBaseValidation,
  snakeCaseBaseCheckoutSession,
  VALIDATION_DEBOUNCE_MS,
};
