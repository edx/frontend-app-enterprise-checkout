import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform/config';

import type { AxiosResponse } from 'axios';

const fetchCheckoutContext = async () => {
  const { ENTERPRISE_ACCESS_BASE_URL } = getConfig();
  const url = `${ENTERPRISE_ACCESS_BASE_URL}/api/v1/bffs/checkout/context/`;
  const result: AxiosResponse = await getAuthenticatedHttpClient().post(url);
  return result;
};

export default fetchCheckoutContext;
