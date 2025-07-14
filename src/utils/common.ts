import { logError } from '@edx/frontend-platform/logging';

/**
 * Given an error, returns the status code from the custom attributes (Axios error)
 * or the standard JS error response.
 * @param {Error} error An error object
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
 * @returns {string} The computed value of the CSS variable.
 */
function getComputedStylePropertyCSSVariable(cssVariableName: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(cssVariableName);
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

export {
  defaultQueryClientRetryHandler,
  getComputedStylePropertyCSSVariable,
  formatPrice,
  queryCacheOnErrorHandler,
};
