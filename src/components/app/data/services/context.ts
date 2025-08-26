import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform/config';
import { camelCaseObject } from '@edx/frontend-platform/utils';

import { isExpired } from '@/utils/common';

import type { AxiosResponse } from 'axios';

const paymentProcessedCheckoutIntentStates = [
  'paid',
  'fulfilled',
  'errored_provisioning',
];

const determineExistingSuccessfulCheckoutIntent = (
  state: CheckoutContextCheckoutIntent['state'],
): boolean | null => (state ? paymentProcessedCheckoutIntentStates.includes(state) : null);

const transformContextResponse = (contextResponse: CheckoutContextResponse) => {
  const baseResponse = (globalThis as any).structuredClone
    ? (globalThis as any).structuredClone(contextResponse)
    : JSON.parse(JSON.stringify(contextResponse));
  const existingSuccessfulCheckoutIntent = baseResponse.checkoutIntent?.state
    ? determineExistingSuccessfulCheckoutIntent(baseResponse.checkoutIntent.state)
    : null;
  const expiredCheckoutIntent = baseResponse.checkoutIntent?.expiresAt
    ? isExpired(baseResponse.checkoutIntent.expiresAt)
    : null;
  if (!baseResponse.checkoutIntent) {
    return baseResponse;
  }
  return {
    ...baseResponse,
    checkoutIntent: {
      ...baseResponse.checkoutIntent,
      existingSuccessfulCheckoutIntent,
      expiredCheckoutIntent,
    },
  };
};

/**
 * Fetches checkout context information from the API
 *
 * This function retrieves information about the checkout context, including:
 * - Existing customers for the authenticated user
 * - Pricing information
 * - Field constraints for form validation
 *
 * @returns A promise that resolves to an AxiosResponse containing the checkout context information
 */
const fetchCheckoutContext = async (): Promise<CheckoutContextResponse> => {
  const { ENTERPRISE_ACCESS_BASE_URL } = getConfig();
  const url = `${ENTERPRISE_ACCESS_BASE_URL}/api/v1/bffs/checkout/context/`;
  const response: AxiosResponse<CheckoutContextResponsePayload> = await getAuthenticatedHttpClient()
    .post<CheckoutContextResponsePayload>(url);
  const camelCasedResponse: CheckoutContextResponse = camelCaseObject(response.data);
  return transformContextResponse(camelCasedResponse);
};

const fetchCheckoutSuccess = async (): Promise<CheckoutContextResponse> => {
  const { ENTERPRISE_ACCESS_BASE_URL } = getConfig();
  const url = `${ENTERPRISE_ACCESS_BASE_URL}/api/v1/bffs/checkout/success/`;
  const response: AxiosResponse<CheckoutContextResponsePayload> = await getAuthenticatedHttpClient()
    .post<CheckoutContextResponsePayload>(url);
  const camelCasedResponse: CheckoutContextResponse = camelCaseObject(response.data);
  return transformContextResponse(camelCasedResponse);
};

export {
  fetchCheckoutContext,
  fetchCheckoutSuccess,
};
