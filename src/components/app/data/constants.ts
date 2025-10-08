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
 * Date formats for displaying dates in the UI.
 */
const SHORT_MONTH_DATE_FORMAT = 'MMM D, YYYY';
const LONG_MONTH_DATE_FORMAT = 'MMMM D, YYYY';

export {
  baseValidation,
  snakeCaseBaseValidation,
  VALIDATION_DEBOUNCE_MS,
  SUBSCRIPTION_TRIAL_LENGTH_DAYS,
  SHORT_MONTH_DATE_FORMAT,
  LONG_MONTH_DATE_FORMAT,
};
