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
};

const EVENT_NAMES = {
  SUBSCRIPTION_CHECKOUT: SUBSCRIPTION_CHECKOUT_EVENTS,
};

export default EVENT_NAMES;
