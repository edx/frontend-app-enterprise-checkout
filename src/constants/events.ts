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
  // BillingDetails
  TOGGLE_TNC_TERMS: `${SUBSCRIPTION_CHECKOUT_PREFIX}.terms_and_conditions_checkbox.toggled`,
  TOGGLE_SUBSCRIPTION_TERMS: `${SUBSCRIPTION_CHECKOUT_PREFIX}.subscription_terms_checkbox.toggled`,
  // BillingDetailsSuccess
};

const EVENT_NAMES = {
  SUBSCRIPTION_CHECKOUT: SUBSCRIPTION_CHECKOUT_EVENTS,
};

export default EVENT_NAMES;
