import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform/config';
import { camelCaseObject } from '@edx/frontend-platform/utils';

const createBillingPortalSession = async (checkoutIntentId) => {
  const { ENTERPRISE_ACCESS_BASE_URL } = getConfig();
  if (!checkoutIntentId) {
    return null;
  }
  const url = `${ENTERPRISE_ACCESS_BASE_URL}/api/v1/customer-billing/${checkoutIntentId}/create-portal-session`;
  const response = await getAuthenticatedHttpClient().get(url);
  return camelCaseObject(response.data);
};

export default createBillingPortalSession;
