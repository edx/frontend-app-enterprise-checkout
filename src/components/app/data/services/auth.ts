import { getConfig } from '@edx/frontend-platform/config';
import { getHttpClient } from '@edx/frontend-platform/auth';
import { setAuthenticatedUser } from '@edx/frontend-platform/auth';

import type { AxiosResponse } from 'axios';

interface LoginPayload {
  email: string;
  password: string;
}

interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: {
    userId: string;
    username: string;
    email: string;
    roles: string[];
    administrator: boolean;
  };
}

/**
 * Authenticates a user by sending login credentials to the login API
 *
 * This function sends the provided login payload to the API and returns
 * authentication data including tokens and user information.
 *
 * @param payload - The login credentials containing email and password
 * @returns A promise that resolves to an AxiosResponse containing the login results
 */
const fetchLogin = async (
  payload: LoginPayload,
): Promise<LoginResponse> => {
  const { LMS_BASE_URL } = getConfig();
  const url = `${LMS_BASE_URL}/api/user/v1/account/login_session/`;
  const response: AxiosResponse<LoginResponse> = await getHttpClient().post(url, payload);
  
  // Set the authenticated user in the auth service
  if (response.data.user) {
    setAuthenticatedUser(response.data.user);
  }
  
  return response.data;
};

export default fetchLogin;