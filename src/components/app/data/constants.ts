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

const VALIDATION_DEBOUNCE_MS = 500;

export {
  baseValidation,
  snakeCaseBaseValidation,
  VALIDATION_DEBOUNCE_MS,
};
