import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform/config';
import { camelCaseObject, snakeCaseObject } from '@edx/frontend-platform/utils';
import axios from 'axios';

import type { AxiosResponse } from 'axios';

/**
 * ==============================
 * Checkout Session Types
 * ==============================
 */
declare global {
  /**
   * Schema for checkout session requests
   * Uses the base checkout schema without additional fields
   */
  type CreateCheckoutSessionRequestSchema = BaseCheckoutSchema;

  /**
   * Successful response structure for checkout session API
   */
  interface CreateCheckoutSessionSuccessResponseSchema {
    checkoutSessionClientSecret: string;
  }

  /**
   * Alias for FieldErrorSchema to maintain backward compatibility
   */
  type CreateCheckoutSessionFieldError = FieldErrorSchema;

  /**
   * Error response structure for checkout session API
   */
  type CreateCheckoutSessionErrorResponseSchema = {
    [K in keyof CreateCheckoutSessionRequestSchema]?: CreateCheckoutSessionFieldError;
  };

  type CreateCheckoutSessionResponseSchema = (
    CreateCheckoutSessionSuccessResponseSchema | CreateCheckoutSessionErrorResponseSchema
  );

  /**
   * Snake_cased versions of above schemas for API communication
   */
  type CreateCheckoutSessionRequestPayload = Payload<CreateCheckoutSessionRequestSchema>;
  type CreateCheckoutSessionResponsePayload = Payload<CreateCheckoutSessionResponseSchema>;
  type CreateCheckoutSessionSuccessResponsePayload = Payload<CreateCheckoutSessionSuccessResponseSchema>;
  type CreateCheckoutSessionErrorResponsePayload = Payload<CreateCheckoutSessionErrorResponseSchema>;
}

const camelCaseResponse = (
  data: CreateCheckoutSessionResponsePayload,
): CreateCheckoutSessionResponseSchema => camelCaseObject(data);

/**
 * Creates a checkout session from the API
 *
 * @param payload - The payload to send to the API
 * @returns A promise that resolves to an AxiosResponse containing either a success or error response
 *
 * @example
 * // Successful response (201 Created)
 * {
 *   "checkout_session_client_secret": "cs_Hu7ixZhnattbh1MoBy5LkdIw"
 * }
 *
 * @example
 * // Error response (422 Unprocessable Entity)
 * {
 *   admin_email: {
 *     "error_code": "not_registered",
 *     "developer_message": "The provided email has not yet been registered."
 *   },
 *   enterprise_slug: {
 *     "error_code": "existing_enterprise_customer",
 *     "developer_message": "Slug conflicts with existing customer."
 *   }
 * }
 */
export default async function createCheckoutSession(
  requestData: CreateCheckoutSessionRequestSchema,
): Promise<AxiosResponse<CreateCheckoutSessionSuccessResponseSchema>> {
  const { ENTERPRISE_ACCESS_BASE_URL } = getConfig();
  const url = `${ENTERPRISE_ACCESS_BASE_URL}/api/v1/customer-billing/create-checkout-session/`;
  const requestPayload: CreateCheckoutSessionRequestPayload = snakeCaseObject(requestData);
  const requestConfig = {
    // Convert response payload (success or error) to a response schema for use by callers.
    //
    // Note: Append to default list of response transformers so that we don't lose the default JSON
    // decode behavior.  This concat() approach is officially condoned by Axios docs:
    // https://github.com/axios/axios/blob/12135b15/examples/transform-response/index.html#L27
    //
    // @ts-ignore(TS2339)
    transformResponse: axios.defaults.transformResponse!.concat(camelCaseResponse),
  };
  const response: AxiosResponse<CreateCheckoutSessionSuccessResponseSchema> = (
    await getAuthenticatedHttpClient().post<CreateCheckoutSessionSuccessResponsePayload>(
      url,
      requestPayload,
      requestConfig,
    )
  );
  return response;
}
