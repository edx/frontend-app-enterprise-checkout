import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform/config';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { debounce } from 'lodash-es';

import { snakeCaseBaseValidation } from '@/components/app/data/constants';

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

let previousQuantity: number | undefined;

const debouncedValidateQuantity = debounce(async (
  quantity: number,
  resolve: (val: boolean) => void,
) => {
  try {
    const response = await fetchCheckoutValidation({
      ...snakeCaseBaseValidation,
      quantity,
      stripe_price_id: 'price_9876_replace-me',
    });
    console.log({ response });
    resolve(true);
  } catch {
    resolve(false);
  }
}, 500);

export const validateQuantity = async (quantity: number) => {
  // Don't revalidate if quantity hasn't changed
  if (quantity === previousQuantity) { return true; }
  previousQuantity = quantity;

  return new Promise<boolean>((resolve) => {
    debouncedValidateQuantity(quantity, resolve);
  });
};

export default fetchCheckoutValidation;
