import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform/config';
import { camelCaseObject } from '@edx/frontend-platform/utils';

export interface CreateBillingPortalSessionResponseSchema {
  url: string;
}

const createBillingPortalSession = async (checkoutIntentId?: number | null) => {
  const { ENTERPRISE_ACCESS_BASE_URL } = getConfig();
  const url = `${ENTERPRISE_ACCESS_BASE_URL}/api/v1/customer-billing/${checkoutIntentId}/create-checkout-portal-session`;
  const response = await getAuthenticatedHttpClient().get(url);
  return camelCaseObject(response.data) as CreateBillingPortalSessionResponseSchema;
};

export default createBillingPortalSession;
