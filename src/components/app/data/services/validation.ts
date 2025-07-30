import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform/config';
import { camelCaseObject } from '@edx/frontend-platform/utils';

import type { AxiosResponse } from 'axios';

/**
 * Validates checkout form data by sending it to the validation API
 *
 * This function sends the provided validation payload to the API and returns
 * validation decisions for each field. The response includes:
 * - Validation decisions for each field (error codes and messages if invalid)
 * - User authentication information
 *
 * @param payload - The validation schema payload containing the data to validate
 * @returns A promise that resolves to an AxiosResponse containing the validation results
 */
const fetchCheckoutValidation = async (
  payload: ValidationSchemaPayload,
): Promise<ValidationResponse> => {
  const { ENTERPRISE_ACCESS_BASE_URL } = getConfig();
  const url = `${ENTERPRISE_ACCESS_BASE_URL}/api/v1/bffs/checkout/validation/`;
  const response: AxiosResponse<ValidationResponsePayload> = await getAuthenticatedHttpClient().post(url, payload);
  return camelCaseObject(response.data);
};

export default fetchCheckoutValidation;
