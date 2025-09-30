import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform/config';
import { camelCaseObject } from '@edx/frontend-platform/utils';

const fetchCheckoutIntent = async (id) => {
  const { ENTERPRISE_ACCESS_BASE_URL } = getConfig();
  const url = `${ENTERPRISE_ACCESS_BASE_URL}/api/v1/checkout-intent/${id}/`;
  const response = await getAuthenticatedHttpClient().get(url);
  return camelCaseObject(response.data);
};

export default fetchCheckoutIntent;
