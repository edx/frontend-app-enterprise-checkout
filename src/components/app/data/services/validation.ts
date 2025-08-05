import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform/config';
import { logError } from '@edx/frontend-platform/logging';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { debounce, isNull } from 'lodash-es';

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
  payload: Partial<ValidationSchemaPayload>,
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
      quantity,
      stripe_price_id: 'price_9876_replace-me',
    });
    if (response?.validationDecisions) {
      resolve(!!isNull(response.validationDecisions.quantity));
      return;
    }
    resolve(false);
  } catch (error) {
    logError(error);
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
