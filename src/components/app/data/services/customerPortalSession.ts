import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform/config';
import { camelCaseObject } from '@edx/frontend-platform/utils';

const fetchCustomerPortalSession = async (lmsUserId: AuthenticatedUser['userId']) => {
  const { ENTERPRISE_ACCESS_BASE_URL } = getConfig();
  const url = `${ENTERPRISE_ACCESS_BASE_URL}/api/v1/customer-billing/${lmsUserId}/create-portal-session`;
  const response = await getAuthenticatedHttpClient().post<{ url: string }>(url);
  return camelCaseObject(response.data);
};

export default fetchCustomerPortalSession;
