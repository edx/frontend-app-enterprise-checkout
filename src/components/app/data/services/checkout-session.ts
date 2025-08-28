import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform/config';
import { camelCaseObject } from '@edx/frontend-platform/utils';

import type { AxiosResponse } from 'axios';

// Type alias for the checkout session response

/**
 * Creates a checkout session from the API
 *
 * @param payload - The payload to send to the API
 * @returns A promise that resolves to an AxiosResponse containing either a success or error response
 *
 * @example
 * // Successful response (201 Created)
 * {
 *   checkout_session: {
 *     client_secret: "cs_test_1234567890abcdef",
 *     expires_at: "1751323210"
 *   }
 * }
 *
 * @example
 * // Error response (422 Unprocessable Entity)
 * {
 *   admin_email: {
 *     error_code: "not_registered",
 *     developer_message: "The provided email has not yet been registered."
 *   },
 *   enterprise_slug: {
 *     error_code: "existing_enterprise_customer",
 *     developer_message: "Slug conflicts with existing customer."
 *   }
 * }
 */
const createCheckoutSession = async (
  payload: CreateCheckoutSessionSchemaPayload,
): Promise<CheckoutSessionResponseType> => {
  // TODO: When this API is called, invalidate the upstream helper, queryCreateCheckoutSession on success
  const { ENTERPRISE_ACCESS_BASE_URL } = getConfig();
  const url = `${ENTERPRISE_ACCESS_BASE_URL}/api/v1/customer-billing/create-checkout-session/`;

  const response: AxiosResponse<CheckoutSessionResponseTypePayload> = await getAuthenticatedHttpClient()
    .post<CheckoutSessionResponseTypePayload>(url, payload);
  return camelCaseObject(response.data);
};

export default createCheckoutSession;
