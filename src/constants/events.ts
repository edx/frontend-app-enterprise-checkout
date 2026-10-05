/**
 * @file Documents event tracking name space
 *
 * Event names should follow the convention of:
 * <project name>.<product name>.<location>.<action>
 *
 * @example edx.ui.admin_portal. (project) subscriptions. (product) table. (location) clicked (action)
 * edx.ui.admin_portal.subscriptions.table.clicked
 */

/**
 * @constant PROJECT_NAME leading project identifier for event names
 */
const PROJECT_NAME = 'edx.ui.enterprise.checkout';

const SUBSCRIPTION_CHECKOUT_PREFIX = `${PROJECT_NAME}.self_service_subscription_checkout`;

const SUBSCRIPTION_CHECKOUT_EVENTS = {
  // PlanDetails
  // PlanDetailsLogin
  // PlanDetailsRegistration
  // AccountDetails
  ACCOUNT_DETAILS_CONTINUE_BUTTON_CLICKED: `${SUBSCRIPTION_CHECKOUT_PREFIX}.account_details_continue_button.clicked`,
  // BillingDetails
  BILLING_DETAILS_SUBSCRIBE_BUTTON_CLICKED: `${SUBSCRIPTION_CHECKOUT_PREFIX}.billing_details_subscribe_button.clicked`,
  TOGGLE_TNC_TERMS: `${SUBSCRIPTION_CHECKOUT_PREFIX}.terms_and_conditions_checkbox.toggled`,
  TOGGLE_SUBSCRIPTION_TERMS: `${SUBSCRIPTION_CHECKOUT_PREFIX}.subscription_terms_checkbox.toggled`,
  // BillingDetailsSuccess
  PAYMENT_PROCESSED_SUCCESSFULLY: `${SUBSCRIPTION_CHECKOUT_PREFIX}.payment_processed_successfully.viewed`,
  SUBSCRIPTION_MANAGEMENT_LINK_CLICKED: `${SUBSCRIPTION_CHECKOUT_PREFIX}.billing_details_success.subscription_management_link.clicked`,
  VIEW_RECEIPT_BUTTON_CLICKED: `${SUBSCRIPTION_CHECKOUT_PREFIX}.billing_details_success.view_receipt_button.clicked`,
  REACH_OUT_LINK_CLICKED: `${SUBSCRIPTION_CHECKOUT_PREFIX}.billing_details_success.reach_out_link.clicked`,
  GO_TO_DASHBOARD_BUTTON_CLICKED: `${SUBSCRIPTION_CHECKOUT_PREFIX}.billing_details_success.go_to_dashboard_button.clicked`,
  CONTACT_SUPPORT_LINK_CLICKED: `${SUBSCRIPTION_CHECKOUT_PREFIX}.billing_details_success.contact_support_link.clicked`,

  // Telemetry tracking
  CHECKOUT_FIELD_BLURRED: `${SUBSCRIPTION_CHECKOUT_PREFIX}.field.blurred`,
  CHECKOUT_PAGE_VIEWED: `${SUBSCRIPTION_CHECKOUT_PREFIX}.page.viewed`,
  CHECKOUT_REGISTRATION_SUCCESS: `${SUBSCRIPTION_CHECKOUT_PREFIX}.registration.success`,
};

/**
 * Normalized checkout funnel events (ENT-12328). These are emitted alongside the legacy
 * SUBSCRIPTION_CHECKOUT events above, gated by FEATURE_SSP_CHECKOUT_SEGMENT_EVENTS_V2.
 *
 * `order_completed` and `order_cancelled` are emitted server-side (enterprise-access) and are
 * listed here only so the full event dictionary lives in one place.
 */
const CHECKOUT_EVENTS = {
  CHECKOUT_STARTED: `${PROJECT_NAME}.checkout_started`,
  STEP_VIEWED_PLAN_DETAILS: `${PROJECT_NAME}.checkout_step_viewed.plan_details`,
  STEP_COMPLETED_PLAN_DETAILS: `${PROJECT_NAME}.checkout_step_completed.plan_details`,
  STEP_VIEWED_ACCOUNT_DETAILS: `${PROJECT_NAME}.checkout_step_viewed.account_details`,
  STEP_COMPLETED_ACCOUNT_DETAILS: `${PROJECT_NAME}.checkout_step_completed.account_details`,
  STEP_VIEWED_BILLING_DETAILS: `${PROJECT_NAME}.checkout_step_viewed.billing_details`,
  STEP_COMPLETED_BILLING_DETAILS: `${PROJECT_NAME}.checkout_step_completed.billing_details`,
  ORDER_COMPLETED: `${PROJECT_NAME}.order_completed`,
  ACCOUNT_CREATED: `${PROJECT_NAME}.account_created`,
  LOGIN_STARTED: `${PROJECT_NAME}.login_started`,
  SIGNED_IN: `${PROJECT_NAME}.signed_in`,
  ORDER_CANCELLED: `${PROJECT_NAME}.order_cancelled`,
};

/**
 * The `step_name` / `step_number` pair attached to every step-scoped checkout event.
 */
export const CHECKOUT_EVENT_STEPS = {
  PLAN_DETAILS: { step_name: 'Plan Details', step_number: 1 },
  ACCOUNT_DETAILS: { step_name: 'Account Details', step_number: 2 },
  BILLING_DETAILS: { step_name: 'Billing Details', step_number: 3 },
} as const;

export type CheckoutEventStep = typeof CHECKOUT_EVENT_STEPS[keyof typeof CHECKOUT_EVENT_STEPS];

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

export const PLAN_TYPE = {
  TEAMS: 'teams',
} as const;

const EVENT_NAMES = {
  SUBSCRIPTION_CHECKOUT: SUBSCRIPTION_CHECKOUT_EVENTS,
  CHECKOUT: CHECKOUT_EVENTS,
};

export default EVENT_NAMES;
