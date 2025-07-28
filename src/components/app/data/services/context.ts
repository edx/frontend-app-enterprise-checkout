import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform/config';
import { camelCaseObject } from '@edx/frontend-platform/utils';

import type { AxiosResponse } from 'axios';

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
  return camelCaseObject(response.data);
};

export default fetchCheckoutContext;
