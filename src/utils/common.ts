import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { logError } from '@edx/frontend-platform/logging';
import dayjs from 'dayjs';
import {getConfig} from "@edx/frontend-platform/config";

/**
 * Given an error, returns the status code from the custom attributes (Axios error)
 * or the standard JS error response.
 * @param {AxiosError} error An error object
 * @returns {number} The status code (e.g., 404)
 */
function getErrorResponseStatusCode(error) {
  return error.customAttributes?.httpErrorStatus || error.response?.status;
}

/**
 * Determines whether a React Query query should be retried on failure.
 *
 * @param {number} failureCount The number of times the query has failed
 * @param {Error} error The error that caused the query to fail
 * @returns {boolean} Whether the query should be retried
 */
function defaultQueryClientRetryHandler(failureCount: number, error: any): boolean {
  return !(failureCount >= 3 || getErrorResponseStatusCode(error) === 404);
}

/**
 * Logs a react-query query error message on failure, if present.
 * @param {Query} query The query object
 * @returns {void}
 */
function queryCacheOnErrorHandler(query) {
  if (query.meta?.errorMessage) {
    logError(query.meta?.errorMessage);
  }
}

/**
 * Given a CSS variable name, returns the computed value of the CSS variable.
 * @param {string} cssVariableName A string representing a CSS variable.
 * @param {string} fallback A fallback value to return if the CSS variable is not found or window is undefined.
 * @returns {string} The computed value of the CSS variable.
 */
function getComputedStylePropertyCSSVariable(cssVariableName: string, fallback: string = '') {
  if (typeof window === 'undefined') {
    return fallback;
  }
  const value = getComputedStyle(document.documentElement).getPropertyValue(cssVariableName).trim();
  return value || fallback;
}

/**
 * Returns a user-friendly message for a field based on server-side validation
 * decisions and a mapping of error codes to messages.
 *
 * This utility intentionally accepts the messages mapping as a parameter to
 * avoid creating circular dependencies with modules that define those mappings.
 *
 * @param {string} field - The field name to read from decisions/messages.
 * @param {ValidationResponse['validationDecisions'] | null | undefined} validationDecisions
 * @param {Record<string, Record<string, string>>} messagesByField - field -> (errorCode -> message)
 * @param {string} [defaultMessage='Failed server-side validation']
 * @returns {string}
 */
function serverValidationError(
  field: string,
  validationDecisions: ValidationResponse['validationDecisions'] | null,
  messagesByField: Record<string, Record<string, string>>,
  defaultMessage: string = 'Failed server-side validation',
): string {
  if (validationDecisions) {
    const decision = (validationDecisions as any)[field] as ValidationDecision | undefined;
    const errorCode = (decision as any)?.errorCode as string | undefined;
    const fieldMessages = messagesByField?.[field];
    if (errorCode && fieldMessages?.[errorCode]) {
      return fieldMessages[errorCode];
    }
  }
  return defaultMessage;
}

const formatPrice = (price: number, options = {}) => {
  const USDollar = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options,
  });
  return USDollar.format(Math.abs(price));
};

const isExpired = (date:string) => dayjs(date).isBefore(dayjs());

const sendEnterpriseCheckoutTrackingEvent = ({
  checkoutIntentId,
  eventName,
  properties = {},
}: {
  checkoutIntentId: CheckoutContextCheckoutIntent['id'] | null;
  eventName: string;
  properties?: Record<string, any>;
}) => {
  sendTrackEvent(
    eventName,
    {
      checkoutIntentId,
      ...properties,
    },
  );
};

/**
 * Determines whether a feature is enabled.
 * A feature is enabled if its configuration value is true, or if a valid
 * feature key or site key is present in the session storage.
 *
 * @param {boolean} enabled - The configuration value for the feature.
 * @param {string|null} featureKey - The specific override key for the feature.
 * @returns {boolean} True if the feature is enabled; otherwise, false.
 */
const isFeatureEnabled = (enabled: boolean, featureKey?: string | null): boolean => {
  const SSP_SESSION_KEY = 'edx.checkout.self-service-purchasing';
  const { FEATURE_SELF_SERVICE_SITE_KEY } = getConfig();
  const sessionKey = sessionStorage.getItem(SSP_SESSION_KEY);

  if (enabled) {
    return true;
  }

  const isUnlockedBySiteKey = !!FEATURE_SELF_SERVICE_SITE_KEY && sessionKey === FEATURE_SELF_SERVICE_SITE_KEY;
  const isUnlockedByFeatureKey = !!featureKey && sessionKey === featureKey;

  return isUnlockedBySiteKey || isUnlockedByFeatureKey;
};

export {
  defaultQueryClientRetryHandler,
  getComputedStylePropertyCSSVariable,
  formatPrice,
  queryCacheOnErrorHandler,
  serverValidationError,
  isExpired,
  sendEnterpriseCheckoutTrackingEvent,
  isFeatureEnabled,
};
