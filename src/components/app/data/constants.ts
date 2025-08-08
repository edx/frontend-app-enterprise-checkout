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
  enterpriseSlug: '',
  quantity: 0,
  stripePriceId: '',
};

const snakeCaseBaseCheckoutSession: CheckoutSessionSchemaPayload = snakeCaseObject(baseCheckoutSession);

export {
  baseValidation,
  baseCheckoutSession,
  snakeCaseBaseValidation,
  snakeCaseBaseCheckoutSession,
};
