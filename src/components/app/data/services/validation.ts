import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform/config';

import type { AxiosResponse } from 'axios';

const fetchCheckoutValidation = async (payload: ValidationSchemaPayload) => {
  const { ENTERPRISE_ACCESS_BASE_URL } = getConfig();
  const url = `${ENTERPRISE_ACCESS_BASE_URL}/api/v1/bffs/checkout/validation/`;
  const result: AxiosResponse = await getAuthenticatedHttpClient().post(url, payload);
  return result;
};

export default fetchCheckoutValidation;
