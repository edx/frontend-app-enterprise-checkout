import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform/config';
import { camelCaseObject, snakeCaseObject } from '@edx/frontend-platform/utils';

import type { AxiosResponse } from 'axios';

/**
 * ==============================
 * User Registration Types (Create)
 * ==============================
 */

declare global {
  /**
   * Data structure for a registration create payload.
   */
  interface RegistrationCreateRequestSchema {
    name: string;
    username: string;
    password: string;
    email: string;
    country: string;
    honorCode?: boolean;
  }

  /**
   * Data structure for a registration create response payload.
   */
  interface RegistrationCreateSuccessResponseSchema {
    success: boolean;
  }

  /**
   * Snake_cased versions of above schemas for API communication
   */
  type RegistrationCreateRequestPayload = Payload<RegistrationCreateRequestSchema>;
  type RegistrationCreateSuccessResponsePayload = Payload<RegistrationCreateSuccessResponseSchema>;
}

/**
 * Performs registration by calling the edx-platform registration endpoint.
 * Mirrors conventions used in services/login.ts.
 *
 * Note: The LMS registration endpoint expects form-urlencoded payload
 * and is a public endpoint (no JWT refresh).
 *
 * @throws {AxiosError<RegistrationErrorResponseSchema>}
 */
export default async function registerRequest(
  requestData: RegistrationCreateRequestSchema,
): Promise<AxiosResponse<RegistrationCreateSuccessResponseSchema>> {
  // Ensure honor_code is always sent as true by default
  const requestPayload: RegistrationCreateRequestPayload = snakeCaseObject({
    ...requestData,
    honorCode: true,
  });
  const requestConfig = {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    // Avoid eagerly intercepting the call to refresh the JWT token---it won't work so don't even try.
    isPublic: true,
    // Convert response payload (success or error) to a response schema for use by callers.
    transformResponse: [
      (data: any): any => camelCaseObject(data),
    ],
  };
  const response: AxiosResponse<RegistrationCreateSuccessResponseSchema> = (
    await getAuthenticatedHttpClient().post<RegistrationCreateSuccessResponsePayload>(
      `${getConfig().LMS_BASE_URL}/api/user/v2/account/registration/`,
      (new URLSearchParams(requestPayload)).toString(),
      requestConfig,
    )
  );
  return response;
}
