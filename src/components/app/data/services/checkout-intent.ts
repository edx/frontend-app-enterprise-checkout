import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform/config';
import { camelCaseObject, snakeCaseObject } from '@edx/frontend-platform/utils';
import axios, { AxiosResponse } from 'axios';

/**
 * Types for creating a CheckoutIntent.
 * These are intentionally minimal for the current usage (Plan Details step).
 * Extend as needed if additional writable fields are later required.
 */
declare global {
  /**
   * Writable request subset for creating a CheckoutIntent.
   * (Backend serializer may accept additional fields; include as needed.)
   */
  interface CreateCheckoutIntentRequestSchema {
    quantity: number;
    enterpriseName?: string;
    enterpriseSlug?: string;
    country?: string;
    termsMetadata?: Record<string, any>;
  }

  /**
   * Success response (shape based on CheckoutIntentCreateRequest / Read serializer).
   * We keep it loose but strongly typed for known fields we might use.
   */
  interface CreateCheckoutIntentSuccessResponseSchema {
    id: number;
    state: string;
    quantity: number;
    enterpriseName?: string;
    enterpriseSlug?: string;
    stripeCheckoutSessionId?: string | null;
    expiresAt?: string;
    created?: string;
    modified?: string;
    // Add any other fields returned by backend as needed
    [key: string]: any;
  }

  type CreateCheckoutIntentErrorResponseSchema = Record<string, unknown>;

  type CreateCheckoutIntentRequestPayload = Payload<CreateCheckoutIntentRequestSchema>;
  type CreateCheckoutIntentSuccessResponsePayload = Payload<CreateCheckoutIntentSuccessResponseSchema>;
  type CreateCheckoutIntentErrorResponsePayload = Payload<CreateCheckoutIntentErrorResponseSchema>;
}

const camelCaseResponse = (
  data: CreateCheckoutIntentSuccessResponsePayload | CreateCheckoutIntentErrorResponsePayload,
) => camelCaseObject(data);

/**
 * createCheckoutIntent
 * POST /api/v1/checkout-intent/
 *
 * Only callable for an authenticated user.
 */
export default async function createCheckoutIntent(
  requestData: CreateCheckoutIntentRequestSchema,
): Promise<AxiosResponse<CreateCheckoutIntentSuccessResponseSchema>> {
  const { ENTERPRISE_ACCESS_BASE_URL } = getConfig();
  const url = `${ENTERPRISE_ACCESS_BASE_URL}/api/v1/checkout-intent/`;
  const requestPayload: CreateCheckoutIntentRequestPayload = snakeCaseObject(requestData);

  const requestConfig = {
    // Preserve default transforms plus our camelCase transform.
    // @ts-ignore(TS2339)
    transformResponse: axios.defaults.transformResponse!.concat(camelCaseResponse),
  };

  const response: AxiosResponse<CreateCheckoutIntentSuccessResponseSchema> = await getAuthenticatedHttpClient()
    .post<CreateCheckoutIntentSuccessResponsePayload>(url, requestPayload, requestConfig);

  return response;
}
