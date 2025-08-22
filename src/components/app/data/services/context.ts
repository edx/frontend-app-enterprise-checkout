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
  return {
    ...camelCasedResponse,
    checkoutIntent: camelCasedResponse.checkoutIntent
      ? {
        ...camelCasedResponse.checkoutIntent,
        existingSuccessfulCheckoutIntent: camelCasedResponse.checkoutIntent?.state
          ? determineExistingSuccessfulCheckoutIntent(camelCasedResponse.checkoutIntent.state)
          : null,
        expiredCheckoutIntent: camelCasedResponse.checkoutIntent?.expiresAt
          ? isExpired(camelCasedResponse.checkoutIntent?.expiresAt)
          : null,
      }
      : null,
  };
};

export default fetchCheckoutContext;
