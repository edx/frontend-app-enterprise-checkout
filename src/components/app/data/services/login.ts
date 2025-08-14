import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { camelCaseObject, snakeCaseObject } from '@edx/frontend-platform/utils';

import type { AxiosResponse } from 'axios';

/**
 * Login service that calls the edx-platform login endpoint.
 * Based on loginRequest from frontend-app-authn.
 */
export default async function loginRequest(requestData: LoginRequestSchema): Promise<LoginResponseSchema> {
  const requestPayload: LoginRequestPayload = snakeCaseObject(requestData);
  const requestConfig = {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    // Avoid eagerly intercepting the call to refresh the JWT token---it won't work so don't even try.
    isPublic: true,
  };
  const response: AxiosResponse<LoginResponsePayload> = await getAuthenticatedHttpClient().post<LoginResponsePayload>(
    `${getConfig().LMS_BASE_URL}/api/user/v2/account/login_session/`,
    (new URLSearchParams(requestPayload)).toString(),
    requestConfig,
  );

  return camelCaseObject(response.data);
}
