import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform/config';
import { camelCaseObject, snakeCaseObject } from '@edx/frontend-platform/utils';
import axios, { AxiosResponse, AxiosResponseTransformer } from 'axios';

/**
 * Types for creating a CheckoutIntent.
 * These are intentionally minimal for the current usage (Plan Details step).
 * Extend as needed if additional writable fields are later required.
 */
declare global {

  type TermsMetadata = {
    readAndAcceptProductDescriptionsMessage?: string,
    confirmSubscribingMessage?: string,
    agreeToRecurringSubscriptionMessage?: string,
  };

  /**
   * CheckoutIntent POST (create) requests.
   */
  interface CheckoutIntentCreateRequestSchema {
    quantity: number;
    enterpriseName?: string;
    enterpriseSlug?: string;
    country?: string;
    termsMetadata?: TermsMetadata;
  }
  type CheckoutIntentCreateErrorResponseSchema = Record<string, unknown>;

  /**
   * CheckoutIntent GET (retrieve) requests.
   */
  type CheckoutIntentRetrieveErrorResponseSchema = Record<string, unknown>;

  /**
   * CheckoutIntent PATCH requests.
   */
  interface CheckoutIntentPatchRequestSchema {
    state: CheckoutIntentState;
    country: string | null;
    termsMetadata: TermsMetadata;
  }
  type CheckoutIntentPatchErrorResponseSchema = Record<string, unknown>;

  /**
   * Serialized CheckoutIntent in all responses.
   */
  interface CheckoutIntent {
    uuid: string,
    id: number,
    created: string,
    modified: string,
    state: CheckoutIntentState,
    enterpriseName: string | null,
    enterpriseSlug: string | null,
    enterpriseUuid: string | null,
    expiresAt: string,
    stripeCustomerId: string | null,
    stripeCheckoutSessionId: string | null,
    quantity: number,
    country: string | null,
    lastCheckoutError: string | null,
    lastProvisioningError: string | null,
    termsMetadata: TermsMetadata,
    user: number,
    workflow: string | null, // UUID
    // Add any other fields returned by backend as needed
    [key: string]: any;
  }

  /*
   * Response schemas for all CheckoutIntent request types.
   */
  type CheckoutIntentCreateSuccessResponseSchema = CheckoutIntent;
  type CheckoutIntentRetrieveSuccessResponseSchema = CheckoutIntent;
  type CheckoutIntentPatchSuccessResponseSchema = CheckoutIntent;

  /**
   * Snake_cased versions of above schemas for API communication
   */
  type CheckoutIntentCreateRequestPayload = Payload<CheckoutIntentCreateRequestSchema>;
  type CheckoutIntentCreateSuccessResponsePayload = Payload<CheckoutIntentCreateSuccessResponseSchema>;
  type CheckoutIntentCreateErrorResponsePayload = Payload<CheckoutIntentCreateErrorResponseSchema>;
  type CheckoutIntentRetrieveSuccessResponsePayload = Payload<CheckoutIntentRetrieveSuccessResponseSchema>;
  type CheckoutIntentPatchRequestPayload = Payload<CheckoutIntentPatchRequestSchema>;
  type CheckoutIntentPatchSuccessResponsePayload = Payload<CheckoutIntentPatchSuccessResponseSchema>;
}

/**
 * createCheckoutIntent
 * POST /api/v1/checkout-intent/
 *
 * Only callable for an authenticated user.
 */
async function createCheckoutIntent(
  requestData: CheckoutIntentCreateRequestSchema,
): Promise<AxiosResponse<CheckoutIntentCreateSuccessResponseSchema>> {
  const { ENTERPRISE_ACCESS_BASE_URL } = getConfig();
  const url = `${ENTERPRISE_ACCESS_BASE_URL}/api/v1/checkout-intent/`;
  const requestPayload: CheckoutIntentCreateRequestPayload = snakeCaseObject(requestData);

  // Normalize the default transformers into something can be concat()'ed to.
  const defaultTransforms: AxiosResponseTransformer[] = (
    [axios.defaults.transformResponse ?? []].flat()
  );
  const requestConfig = {
    // Preserve default transforms plus our camelCase transform.
    transformResponse: defaultTransforms.concat(camelCaseObject),
  };

  const response: AxiosResponse<CheckoutIntentCreateSuccessResponseSchema> = (
    await getAuthenticatedHttpClient().post<CheckoutIntentCreateSuccessResponsePayload>(
      url,
      requestPayload,
      requestConfig,
    )
  );

  return response;
}

/**
 * fetchCheckoutIntent
 * GET /api/v1/checkout-intent/<id>
 *
 * Only callable for an authenticated user.
 */
async function fetchCheckoutIntent({
  id,
  uuid,
}: {
  id?: number,
  uuid?: string,
}): Promise<AxiosResponse<CheckoutIntentRetrieveSuccessResponseSchema>> {
  const idCoalesced = uuid || id;
  const { ENTERPRISE_ACCESS_BASE_URL } = getConfig();
  const url = `${ENTERPRISE_ACCESS_BASE_URL}/api/v1/checkout-intent/${idCoalesced}/`;

  // Normalize the default transformers into something can be concat()'ed to.
  const defaultTransforms: AxiosResponseTransformer[] = (
    [axios.defaults.transformResponse ?? []].flat()
  );
  const requestConfig = {
    // Preserve default transforms plus our camelCase transform.
    transformResponse: defaultTransforms.concat(camelCaseObject),
  };

  const response: AxiosResponse<CheckoutIntentRetrieveSuccessResponseSchema> = (
    await getAuthenticatedHttpClient().get<CheckoutIntentRetrieveSuccessResponsePayload>(
      url,
      requestConfig,
    )
  );

  return response;
}

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
      "read_and_accept_product_descriptions_message": "I have read and accepted the edX Enterprise Product...",
      "confirm_subscribing_message": "I confirm I am subscribing on behalf of my employer, school or other...",
      "agree_to_recurring_subscription_message": "I agree to enroll in a recurring annual subscription for $/year USD."
    }
  }
 */

async function patchCheckoutIntent({
  id,
  uuid,
  requestData,
}: {
  id?: number,
  uuid?: string,
  requestData: CheckoutIntentPatchRequestSchema,
}): Promise<AxiosResponse<CheckoutIntentPatchSuccessResponseSchema>> {
  const idCoalesced = uuid || id;
  const { ENTERPRISE_ACCESS_BASE_URL } = getConfig();
  const url = `${ENTERPRISE_ACCESS_BASE_URL}/api/v1/checkout-intent/${idCoalesced}/`;
  const requestPayload: CheckoutIntentPatchRequestPayload = snakeCaseObject(requestData);

  // Normalize the default transformers into something can be concat()'ed to.
  const defaultTransforms: AxiosResponseTransformer[] = (
    [axios.defaults.transformResponse ?? []].flat()
  );
  const requestConfig = {
    // Preserve default transforms plus our camelCase transform.
    transformResponse: defaultTransforms.concat(camelCaseObject),
  };

  const response: AxiosResponse<CheckoutIntentPatchSuccessResponseSchema> = (
    await getAuthenticatedHttpClient().patch<CheckoutIntentPatchSuccessResponsePayload>(
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
