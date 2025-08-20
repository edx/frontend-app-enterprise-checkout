import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform/config';
import { camelCaseObject, snakeCaseObject } from '@edx/frontend-platform/utils';

import type { AxiosResponse } from 'axios';

/**
 * ==============================
 * Login Request/Response Types
 * ==============================
 */

declare global {
  /**
   * Data structure for a login request payload.
   */
  interface LoginRequestSchema {
    emailOrUsername: string;
    password: string;
  }

  /**
   * Data structure for a login response payload.
   */
  interface LoginSuccessResponseSchema {
    redirectUrl: string;
    success: boolean;
  }

  /**
   * Data structure for an error response payload.
   */
  interface LoginErrorResponseSchema {
    nonFieldErrors?: string[];
    email?: string[];
    password?: string[];
    detail?: string;
  }

  type LoginResponseSchema = LoginSuccessResponseSchema | LoginErrorResponseSchema;

  /**
   * Snake_cased versions of above schemas for API communication
   */
  type LoginRequestPayload = Payload<LoginRequestSchema>;
  type LoginResponsePayload = Payload<LoginResponseSchema>;
  type LoginSuccessResponsePayload = Payload<LoginSuccessResponseSchema>;
  type LoginErrorResponsePayload = Payload<LoginErrorResponseSchema>;
}

/**
 * Login service that calls the edx-platform login endpoint.
 * Based on loginRequest from frontend-app-authn.
 *
 * @throws {AxiosError<LoginErrorResponseSchema>}
 */
export default async function loginRequest(
  requestData: LoginRequestSchema,
): Promise<AxiosResponse<LoginSuccessResponseSchema>> {
  const requestPayload: LoginRequestPayload = snakeCaseObject(requestData);
  const requestConfig = {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    // Avoid eagerly intercepting the call to refresh the JWT token---it won't work so don't even try.
    isPublic: true,
    // Convert response payload (success or error) to a response schema for use by callers.
    transformResponse: [
      (data: LoginResponsePayload): LoginResponseSchema => camelCaseObject(data),
    ],
  };
  const response: AxiosResponse<LoginSuccessResponseSchema> = (
    await getAuthenticatedHttpClient().post<LoginSuccessResponsePayload>(
      `${getConfig().LMS_BASE_URL}/api/user/v2/account/login_session/`,
      (new URLSearchParams(requestPayload)).toString(),
      requestConfig,
    )
  );
  return response;
}
