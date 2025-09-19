import { snakeCaseObject } from '@edx/frontend-platform';

/**
 * Base validation schema for form fields.
 */
const baseValidation: ValidationSchema = {
  adminEmail: '',
  companyName: '',
  enterpriseSlug: '',
  stripePriceId: 'price_9876_replace-me',
  quantity: 0,
  fullName: '',
};

/**
 * Base validation schema for form fields.
 */
const snakeCaseBaseValidation: ValidationSchemaPayload = snakeCaseObject(baseValidation);

/**
 * Debounce time for form validation.
 */
const VALIDATION_DEBOUNCE_MS = 500;

/**
 * Number of days in a subscription trial.
 */
const SUBSCRIPTION_TRIAL_LENGTH_DAYS = 14;

/**
 * Date format for displaying dates in the UI.
 */
const DATE_FORMAT = 'MMM D, YYYY';

export {
  baseValidation,
  snakeCaseBaseValidation,
  VALIDATION_DEBOUNCE_MS,
  SUBSCRIPTION_TRIAL_LENGTH_DAYS,
  DATE_FORMAT,
};
