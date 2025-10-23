import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform/config';
import { camelCaseObject, snakeCaseObject } from '@edx/frontend-platform/utils';
import { debounce } from 'lodash-es';

import { VALIDATION_DEBOUNCE_MS } from '@/components/app/data/constants';

import type { AxiosResponse } from 'axios';

/**
 * ==============================
 * Registration Request/Response Types
 * ==============================
 */

declare global {
  /**
   * Data structure for a registration validation request payload.
   */
  interface RegistrationRequestSchema {
    email: string;
    name: string;
    username: string;
    password: string;
    country: string;
  }

  /**
   * Data structure for an error response payload (used by create API failures).
   */
  interface RegistrationErrorResponseSchema {
    email?: string[];
    name?: string[];
    username?: string[];
    password?: string[];
    country?: string[];
    [key: string]: string[] | undefined;
  }

  /**
   * Snake_cased version of the validation request schema for API communication.
   */
  type RegistrationRequestPayload = Payload<RegistrationRequestSchema>;

  /**
   * API response from LMS registration validation endpoint.
   * validationDecisions contain empty strings for valid fields, and error messages otherwise.
   */
  interface RegistrationValidationDecisionsSchema {
    name: string;
    username: string;
    email: string;
    password: string;
    country: string;
  }

  interface RegistrationValidationApiResponseSchema {
    validationDecisions: RegistrationValidationDecisionsSchema;
    usernameSuggestions?: string[];
  }

  /**
   * Account creation (register) request/response schemas.
   */
  interface RegistrationCreateRequestSchema {
    name: string;
    username: string;
    password: string;
    email: string;
    country: string;
    honorCode?: boolean;
  }

  interface RegistrationCreateSuccessResponseSchema {
    success: boolean;
  }

  /**
   * Snake_cased versions of the create schemas for API communication.
   */
  type RegistrationCreateRequestPayload = Payload<RegistrationCreateRequestSchema>;
  type RegistrationCreateSuccessResponsePayload = Payload<RegistrationCreateSuccessResponseSchema>;
}

/**
 * Validates registration form data by sending it to the LMS registration validation API
 *
 * This function sends the provided registration data to the LMS validation endpoint
 * and returns validation decisions for each field. The function:
 * - Performs validation only and does not actually create user accounts
 * - Converts camelCase request data to snake_case for API communication
 * - Transforms API responses back to camelCase for client use
 * - Uses form-encoded data format as required by the LMS API
 * - Bypasses JWT token refresh since this is a public endpoint
 * - Does not throw for field validation failures; instead, the API returns
 *   messages in `validation_decisions` (empty string means the field passed)
 *
 * @param requestData - The registration form data to validate containing user information
 * @returns A promise that resolves to an AxiosResponse with validation results
 * @throws {AxiosError<RegistrationErrorResponseSchema>} For HTTP/network/server errors while calling the API
 *
 * @example
 * // Validate registration data
 * try {
 *   const result = await validateRegistrationRequest({
 *     email: 'user@example.com',
 *     name: 'John Doe',
 *     username: 'johndoe',
 *     password: 'securePassword123',
 *     country: 'US'
 *   });
 *   // Validation errors (if any) are returned in result.data.validationDecisions
 *   console.log('Validation request resolved:', result.data);
 * } catch (error) {
 *   // Only network/server failures reach here
 *   console.error('Validation request failed:', (error as any)?.response?.data ?? error);
 * }
 */
export default async function validateRegistrationRequest(
  requestData: RegistrationRequestSchema,
): Promise<AxiosResponse<RegistrationValidationApiResponseSchema>> {
  const requestPayload: RegistrationRequestPayload = snakeCaseObject(requestData);
  const requestConfig = {
    headers: { 'Content-type': 'application/x-www-form-urlencoded' },
    // Avoid eagerly intercepting the call to refresh the JWT token---it won't work so don't even try.
    isPublic: true,
  };
  const response: AxiosResponse<RegistrationValidationApiResponseSchema> = (
    await getAuthenticatedHttpClient().post(
      `${getConfig().LMS_BASE_URL}/api/user/v1/validation/registration`,
      (new URLSearchParams(requestPayload)).toString(),
      requestConfig,
    )
  ) as AxiosResponse<RegistrationValidationApiResponseSchema>;
  return camelCaseObject(response);
}

/**
 * Validates registration form fields and returns structured error information with field mapping
 *
 * This function acts as a wrapper around validateRegistrationRequest to provide
 * a simplified interface for form validation. The function:
 * - Calls the LMS registration validation API through validateRegistrationRequest
 * - Interprets the API's `validation_decisions` contract where an empty string
 *   means the field passed, and any non-empty string is an error message
 * - Transforms LMS field names to match frontend form field names
 *   (email → adminEmail, name → fullName, etc.)
 * - Returns a consistent validation result structure for form integration
 * - Treats HTTP/network/server errors as non-blocking and returns a safe default
 *   of `{ isValid: true, errors: {} }` without throwing
 *
 * @param values - The registration form data containing all required user information
 * @returns A promise that resolves to validation results containing:
 *  - `isValid`: boolean indicating if all fields passed validation
 *  - `errors`: Record mapping field names to error messages (empty if valid)
 *
 * @example
 * // Validate registration form data
 * const result = await validateRegistrationFields({
 *   email: 'user@example.com',
 *   name: 'John Doe',
 *   username: 'johndoe',
 *   password: 'securePassword123',
 *   country: 'US'
 * });
 *
 * if (result.isValid) {
 *   console.log('All fields are valid');
 * } else {
 *   console.log('Validation errors:', result.errors);
 *   // Example errors: { adminEmail: 'Email already exists', username: 'Username too short' }
 * }
 *
 * @example
 * // Network/server errors are handled internally and do not throw
 * const { isValid, errors } = await validateRegistrationFields(formData);
 * // If the request failed, this will fall back to: isValid === true and errors === {}
 */
export async function validateRegistrationFields(
  values: RegistrationRequestSchema,
): Promise<{ isValid: boolean; errors: Record<string, string> }> {
  try {
    const response = await validateRegistrationRequest(values);
    const { validationDecisions } = response.data;
    // Map LMS field names to our form field names
    const fieldMapping: Record<string, string> = {
      email: 'adminEmail',
      name: 'fullName',
      username: 'username',
      password: 'password',
      country: 'country',
    };

    const errors: Record<string, string> = {};
    Object.entries(validationDecisions || {}).forEach(([field, message]) => {
      if (typeof message === 'string' && message.trim()) {
        const mappedField = fieldMapping[field] || field;
        errors[mappedField] = message;
      }
    });
    return { isValid: Object.keys(errors).length === 0, errors };
  } catch (error) {
    // Treat HTTP/network/server errors as non-blocking; do not parse validation here.
    return { isValid: true, errors: {} };
  }
}

/**
 * Memoization cache storing validation results keyed by serialized form values.
 * Prevents unnecessary API calls by returning the last known result for the same input.
 */
const registrationValidationResultCache = new Map<string, { isValid: boolean; errors: Record<string, string> }>();

/**
 * Singleton storage for the debounced registration validator function.
 * Initialized lazily by getRegistrationDebouncer() and reused across calls.
 */
let debouncedRegistrationValidator: ReturnType<typeof debounce> | null = null;

/**
 * Returns (and caches) a debounced async validator function for registration fields.
 *
 * This function creates and caches a single debounced validator instance that wraps
 * the validateRegistrationFields function. The returned debounced function will:
 * - Call the validateRegistrationFields function with debouncing applied
 * - Debounce calls so rapid changes only trigger validation once per configured wait time (500ms)
 * - Handle errors gracefully by returning a fallback result of `{ isValid: true, errors: {} }`
 *   when a network/server error occurs
 * - Use a promise-based callback pattern for async resolution
 * - Maintain singleton behavior by caching the debounced function instance
 *
 * @returns A debounced validation function with the signature:
 *   `(values: RegistrationRequestSchema,
 *     resolve: (result: { isValid: boolean; errors: Record<string, string> }) => void) => void`
 *   where:
 *     - `values` is the registration data to validate
 *     - `resolve` is a callback that receives the validation result
 *
 * @example
 * // Get the debounced validator (cached after first call)
 * const debouncedValidator = getRegistrationDebouncer();
 *
 * // Use it to validate registration data with debouncing
 * debouncedValidator(
 *   {
 *     email: 'user@example.com',
 *     name: 'John Doe',
 *     username: 'johndoe',
 *     password: 'securePassword123',
 *     country: 'US'
 *   },
 *   (result) => {
 *     if (result.isValid) {
 *       console.log('Registration data is valid');
 *     } else {
 *       console.log('Validation errors:', result.errors);
 *     }
 *   }
 * );
 */
function getRegistrationDebouncer() {
  if (!debouncedRegistrationValidator) {
    debouncedRegistrationValidator = debounce(
      async (
        values: RegistrationRequestSchema,
        resolve: (result: { isValid: boolean; errors: Record<string, string> }) => void,
      ) => {
        try {
          const result = await validateRegistrationFields(values);
          resolve(result);
        } catch (error) {
          // Network/server issues: do not block user input; treat as temporarily valid
          resolve({ isValid: true, errors: {} });
        }
      },
      VALIDATION_DEBOUNCE_MS,
    );
  }
  return debouncedRegistrationValidator;
}

/**
 * Validates registration form data with debouncing and previous-value caching to prevent excessive API calls.
 *
 * This function provides an optimized interface for registration validation by wrapping
 * validateRegistrationFields with performance enhancements. The function:
 * - Uses a debounced function from getRegistrationDebouncer so that multiple rapid
 *   calls collapse into one API request per configured wait time (500ms)
 * - Memoizes results for previously seen values and returns the last known result
 *   for identical inputs without calling the API again
 * - Maintains the same interface as validateRegistrationFields for easy replacement
 * - Creates cache keys based on JSON serialization of all form values
 *
 * @param values - The registration form data containing all required user information
 * @returns A Promise that resolves to validation results containing:
 *  - `isValid`: boolean indicating if all fields passed validation
 *  - `errors`: Record mapping field names to error messages (empty if valid)
 *
 * @example
 * // Use debounced validation in form handlers (recommended for real-time validation)
 * const handleFormChange = async (formData) => {
 *   const result = await validateRegistrationFieldsDebounced({
 *     email: formData.email,
 *     name: formData.fullName,
 *     username: formData.username,
 *     password: formData.password,
 *     country: formData.country
 *   });
 *
 *   if (!result.isValid) {
 *     setFieldErrors(result.errors);
 *   }
 * };
 *
 * @example
 * // Multiple rapid calls will be debounced to a single API request
 * await validateRegistrationFieldsDebounced(formData1); // Will trigger API call
 * await validateRegistrationFieldsDebounced(formData2); // Will cancel previous and trigger new API call
 * await validateRegistrationFieldsDebounced(formData2); // Will return cached result (no API call)
 *
 * @example
 * // Integration with Zod schema validation
 * const registrationSchema = z.object({...}).superRefine(async (data, ctx) => {
 *   const { isValid, errors } = await validateRegistrationFieldsDebounced({
 *     email: data.adminEmail,
 *     name: data.fullName,
 *     username: data.username,
 *     password: data.password,
 *     country: data.country,
 *   });
 *
 *   if (!isValid) {
 *     Object.entries(errors).forEach(([field, message]) => {
 *       ctx.addIssue({ code: z.ZodIssueCode.custom, message, path: [field] });
 *     });
 *   }
 * });
 */
export async function validateRegistrationFieldsDebounced(
  values: RegistrationRequestSchema,
): Promise<{ isValid: boolean; errors: Record<string, string> }> {
  // Create a cache key based on all values
  const cacheKey = JSON.stringify(values);

  // If we have a memoized result for these values, return it to avoid an API call
  const cached = registrationValidationResultCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  // Otherwise, debounce the validation request and memoize the result when it resolves
  return new Promise((resolve) => {
    const debounced = getRegistrationDebouncer();
    debounced(values, (result) => {
      registrationValidationResultCache.set(cacheKey, result);
      resolve(result);
    });
  });
}

/**
 * Performs registration by calling the edx-platform registration endpoint.
 * Mirrors conventions used in services/login.ts.
 *
 * Behavior details:
 * - Sends an application/x-www-form-urlencoded payload (as required by the LMS API)
 * - Forces `honorCode` to `true` in the outbound request
 * - Treats the endpoint as public (no JWT refresh interception)
 * - Returns a camelCased AxiosResponse on success
 *
 * @throws {AxiosError<RegistrationErrorResponseSchema>} For HTTP/network/server errors
 */
export async function registerRequest(
  requestData: RegistrationCreateRequestSchema,
): Promise<AxiosResponse<RegistrationCreateSuccessResponseSchema>> {
  // Ensure honor_code is always sent as true by default
  const requestPayload: RegistrationCreateRequestPayload = snakeCaseObject({
    ...requestData,
    honorCode: true,
  });
  const requestConfig = {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    // Avoid eagerly intercepting the call to refresh the JWT token---it won't work so don't even try.
    isPublic: true,
  } as const;
  const formParams = new URLSearchParams();
  Object.entries(requestPayload as Record<string, unknown>).forEach(([key, value]) => {
    formParams.append(key, String(value));
  });

  const response: AxiosResponse<RegistrationCreateSuccessResponseSchema> = (
    await getAuthenticatedHttpClient().post<RegistrationCreateSuccessResponsePayload>(
      `${getConfig().LMS_BASE_URL}/api/user/v2/account/registration/`,
      formParams.toString(),
      requestConfig,
    )
  );
  return camelCaseObject(response);
}
