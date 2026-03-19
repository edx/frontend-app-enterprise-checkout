/**
 * @file Tracking constants for Segment event instrumentation
 *
 * This file defines event names and constants used for tracking user interactions
 * and page views throughout the SSP checkout flow.
 */

/**
 * Tracking event names for checkout flow
 */
export const TRACKING_EVENT_NAMES = {
  CHECKOUT_FIELD_BLUR: 'checkout.field.blur',
  CHECKOUT_PAGE_VIEW: 'checkout.page.view',
  CHECKOUT_REGISTRATION_SUCCESS: 'checkout.registration.success',
} as const;

/**
 * Step constants for checkout flow tracking
 */
export const CHECKOUT_STEPS = {
  PLAN_DETAILS: 'plan_details',
  ACCOUNT_DETAILS: 'account_details',
  REGISTRATION: 'registration',
} as const;

/**
 * Field name constants for tracking
 */
export const TRACKED_FIELDS = {
  // Plan Details step
  NUM_LICENSES: 'numLicenses',
  FULL_NAME: 'fullName',
  ADMIN_EMAIL: 'adminEmail',
  COUNTRY: 'country',

  // Registration step
  USERNAME: 'username',
  PASSWORD: 'password',

  // Account Details step
  COMPANY_NAME: 'companyName',
  URL_SLUG: 'urlSlug',
} as const;

/**
 * Plan type constant
 */
export const PLAN_TYPE = {
  TEAMS: 'teams',
} as const;
