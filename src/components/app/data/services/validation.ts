import { snakeCaseObject } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform/config';
import { logError } from '@edx/frontend-platform/logging';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { debounce, isEqual, snakeCase } from 'lodash-es';

import { VALIDATION_DEBOUNCE_MS } from '@/components/app/data/constants';

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

type FieldKey = keyof ValidationSchema;

// Cache previous values per field
const previousValues = new Map<FieldKey, unknown>();

// Store debounced validators per field
const debouncers = new Map<FieldKey, ReturnType<typeof debounce>>();

/**
 * Returns (and caches) a debounced async validator function for a given field.
 *
 * The returned debounced function will:
 *  - Call the server-side checkout validation API (`fetchCheckoutValidation`)
 *    for the given field and its value, plus any optional extra fields/values.
 *  - Convert both the main field key and all extra field keys to `snake_case`
 *    for the API payload.
 *  - Consider validation successful only if the API returns `null` decisions
 *    for the main field **and** all provided extras.
 *  - Debounce calls so rapid changes to the same field only trigger the API
 *    once per configured wait time (500 ms default here).
 *
 * @template K - The key of the main field being validated (must exist in ValidationSchema).
 * @param field - The main field name in camelCase (e.g., `'quantity'`, `'fullName'`).
 * @returns A debounced validation function with the signature:
 *   `(value: ValidationSchema[K], extras?: Partial<ValidationSchemaPayload>,
 *   resolve: (valid: boolean) => void) => void`
 *   where:
 *     - `value` is the value to validate for the main field
 *     - `extras` is an optional object of other fields/values to include and require as valid
 *     - `resolve` is a callback that receives `true` if all fields validate successfully, otherwise `false`
 *
 * @example
 * // Create a debounced validator for quantity that also validates stripePriceId
 * const debouncedQuantityValidator = getDebouncer('quantity');
 *
 * debouncedQuantityValidator(
 *   42,
 *   { stripePriceId: 'price_123' },
 *   (valid) => {
 *     console.log(valid ? 'Valid' : 'Invalid');
 *   }
 * );
 */
function getDebouncer<K extends FieldKey>(field: K) {
  if (!debouncers.has(field)) {
    debouncers.set(
      field,
      debounce(
        async (
          value: ValidationSchema[K],
          extras: Partial<ValidationSchema> | undefined,
          resolve: (result: { isValid: boolean; validationDecisions: ValidationResponse['validationDecisions'] | null }) => void,
        ) => {
          try {
            const payload: Partial<ValidationSchema> = {
              [snakeCase(field)]: value,
              ...snakeCaseObject(extras) ?? {},
            };
            const response = await fetchCheckoutValidation(payload);
            const decisions = response?.validationDecisions ?? {};
            // All fields to check: main + extras
            const fieldsToCheck: FieldKey[] = [
              field,
              ...(extras ? (Object.keys(extras) as FieldKey[]) : []),
            ];

            const allValid = !fieldsToCheck.filter(k => decisions[k] != null)?.length;
            resolve({ isValid: allValid, validationDecisions: decisions });
          } catch (err) {
            logError(err);
            resolve({ isValid: false, validationDecisions: null });
          }
        },
        VALIDATION_DEBOUNCE_MS,
      ),
    );
  }
  return debouncers.get(field)!;
}

/**
 * Validates a single field value against the checkout API with debouncing and previous-value caching.
 *
 * - Uses a per-field debounced function from `getDebouncer` so that
 *   multiple rapid calls for the same field collapse into one API request.
 * - Skips validation entirely if the value has not changed since the last check.
 * - Resolves to `true` if the API returns a `null` decision for the field
 *   (meaning no errors), otherwise `false`.
 *
 * @template K - The key of the field being validated (must be in ValidationSchema).
 * @param field - The field name (e.g., `'quantity'`, `'fullName'`).
 * @param value - The value to validate for this field.
 * @param extras - Optional additional fields to include in the validation payload
 *                 (e.g., `{ stripe_price_id: 'price_9876' }`).
 * @returns A Promise that resolves to:
 *  - `true` if the server-side validation passes
 *  - `false` if it fails or an error occurs
 *
 * @example
 * // In a Zod refinement:
 * z.string().refine(
 *   (fullName) => validateField('fullName', fullName),
 *   { message: 'Invalid name' }
 * );
 *
 * @example
 * // With extras:
 * validateField('quantity', 10, { stripe_price_id: 'price_123' })
 *   .then((isValid) => console.log(isValid));
 */
/**
 * Validates a single field value against the checkout API and returns a detailed result.
 * - Debounced per field (via getDebouncer)
 * - Caches previous values and skips when unchanged
 */
export function validateFieldDetailed<K extends FieldKey>(
  field: K,
  value: ValidationSchema[K],
  extras?: Partial<ValidationSchema>,
  overridePrevious: boolean = false,
): Promise<{ isValid: boolean; validationDecisions: ValidationResponse['validationDecisions'] | null }> {
  const current = { value, extras: extras ?? {} };
  if (!overridePrevious && isEqual(previousValues.get(field), current)) {
    // Treat unchanged value as valid and with no new decisions
    return Promise.resolve({ isValid: true, validationDecisions: {} });
  }
  previousValues.set(field, current);
  return new Promise((resolve) => {
    const debounced = getDebouncer(field);
    debounced(value, extras, resolve);
  });
}

export default fetchCheckoutValidation;
