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
  
  type TermsMetadata = {
    readAndAcceptProductDescriptionsMessage: string,
    confirmSubscribingMessage: string,
    agreeToRecurringSubscriptionMessage: string,
  };
  
  /**
   * Writable request subset for creating a CheckoutIntent.
   * (Backend serializer may accept additional fields; include as needed.)
   */
  interface CreateCheckoutIntentRequestSchema {
    quantity: number;
    enterpriseName?: string;
    enterpriseSlug?: string;
    country?: string;
    termsMetadata?: TermsMetadata;
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

  /**
   * Schema for checkout session patch requests
   */
  interface CheckoutIntentPatchRequestSchema {
    id: number;
    state: CheckoutIntentState;
    country: string | null;
    termsMetadata: TermsMetadata;
  }

  interface CheckoutIntentPatchResponseSchema {
    id: number;
    created: string;
    modified: string;
    state: CheckoutIntentState;
    enterpriseName: string;
    enterpriseSlug: string;
    enterpriseUuid: string | null;
    stripeCustomerId: string | null;
    expiresAt: string;
    stripeCheckoutSessionId: string | null;
    quantity: number;
    country: string | null;
    lastCheckoutError: string | null;
    lastProvisioningError: string | null;
    termsMetadata: TermsMetadata;
    user: number;
    workflow: string | null;
  }

  /**
   * Snake_cased versions of above schemas for API communication
   */
  type CheckoutIntentPatchRequestPayload = Payload<CheckoutIntentPatchRequestSchema>;
  type CheckoutIntentPatchResponsePayload = Payload<CheckoutIntentPatchResponseSchema>;

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
async function createCheckoutIntent(
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


const fetchCheckoutIntent = async (id) => {
  const { ENTERPRISE_ACCESS_BASE_URL } = getConfig();
  const url = `${ENTERPRISE_ACCESS_BASE_URL}/api/v1/checkout-intent/${id}/`;
  const response = await getAuthenticatedHttpClient().get(url);
  return camelCaseObject(response.data);
};

/**
 * Updates checkout intent from the API
 *
 * @param payload - The payload to send to the API
 * @returns A promise that resolves to an AxiosResponse containing updated checkout intent
 *
 * @example
 * // Successful response (200 OK)
  {
    "id": 2,
    "country": "US",
    "state": "created",
    "terms_metadata": {
      "read_and_accept_product_descriptions_message": "I have read and accepted the edX Enterprise Product Descriptions and Terms and edX Enterprise Sales Terms and Conditions.",
      "confirm_subscribing_message": "I confirm I am subscribing on behalf of my employer, school or other professional organization for use by my institution's employees, students and/or other sponsored learners.",
      "agree_to_recurring_subscription_message": "I agree to enroll in a recurring annual subscription for {price}/year USD."
    }
  }
 */
export default async function patchCheckoutIntent(
  requestData: CheckoutIntentPatchRequestSchema,
): Promise<AxiosResponse<CheckoutIntentPatchResponseSchema>> {
  const { ENTERPRISE_ACCESS_BASE_URL } = getConfig();
  // https://enterprise-access-internal.stage.edx.org/api/v1/checkout-intent/{id}/
  const url = `${ENTERPRISE_ACCESS_BASE_URL}/api/v1/checkout-intent/${requestData.id}/`;
  const requestPayload: CheckoutIntentPatchRequestPayload = snakeCaseObject(requestData);
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
  const response: AxiosResponse<CheckoutIntentPatchResponseSchema> = (
    await getAuthenticatedHttpClient().patch<CheckoutIntentPatchResponseSchema>(
      url,
      requestPayload,
      requestConfig,
    )
  );
  return response;
}

export {
  createCheckoutIntent,
  fetchCheckoutIntent,
  patchCheckoutIntent,
};
