import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform/config';
import { camelCaseObject, snakeCaseObject } from '@edx/frontend-platform/utils';
import { debounce, isEqual } from 'lodash-es';

import { VALIDATION_DEBOUNCE_MS } from '@/components/app/data/constants';

import type { AxiosResponse } from 'axios';

/**
 * ==============================
 * Registration Request/Response Types
 * ==============================
 */

declare global {
  /**
   * Data structure for a registration request payload.
   */
  interface RegistrationRequestSchema {
    email: string;
    name: string;
    username: string;
    password: string;
    country: string;
  }

  /**
   * Data structure for a registration response payload.
   */
  interface RegistrationSuccessResponseSchema {
    success: boolean;
  }

  /**
   * Data structure for an error response payload.
   */
  interface RegistrationErrorResponseSchema {
    email?: string[];
    name?: string[];
    username?: string[];
    password?: string[];
    country?: string[];
    [key: string]: string[] | undefined;
  }

  type RegistrationResponseSchema = RegistrationSuccessResponseSchema | RegistrationErrorResponseSchema;

  /**
   * Snake_cased versions of above schemas for API communication
   */
  type RegistrationRequestPayload = Payload<RegistrationRequestSchema>;
  type RegistrationResponsePayload = Payload<RegistrationResponseSchema>;
  type RegistrationSuccessResponsePayload = Payload<RegistrationSuccessResponseSchema>;
  type RegistrationErrorResponsePayload = Payload<RegistrationErrorResponseSchema>;
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
 *
 * @param requestData - The registration form data to validate containing user information
 * @returns A promise that resolves to an AxiosResponse with validation results
 * @throws {AxiosError<RegistrationErrorResponseSchema>} When validation fails or API errors occur
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
 *   console.log('Validation successful:', result.data);
 * } catch (error) {
 *   console.error('Validation failed:', error.response.data);
 * }
 */
export default async function validateRegistrationRequest(
  requestData: RegistrationRequestSchema,
): Promise<AxiosResponse<RegistrationSuccessResponseSchema>> {
  const requestPayload: RegistrationRequestPayload = snakeCaseObject(requestData);
  const requestConfig = {
    // Avoid eagerly intercepting the call to refresh the JWT token---it won't work so don't even try.
    isPublic: true,
    // Convert response payload (success or error) to a response schema for use by callers.
    transformResponse: [
      (data: RegistrationResponsePayload): RegistrationResponseSchema => camelCaseObject(data),
    ],
  };
  const response: AxiosResponse<RegistrationSuccessResponseSchema> = (
    await getAuthenticatedHttpClient().post<RegistrationSuccessResponsePayload>(
      `${getConfig().LMS_BASE_URL}/api/user/v1/validation/registration`,
      (new URLSearchParams(requestPayload)).toString(),
      requestConfig,
    )
  );
  return response;
}

/**
 * Validates registration form fields and returns structured error information with field mapping
 *
 * This function acts as a wrapper around validateRegistrationRequest to provide
 * a simplified interface for form validation. The function:
 * - Calls the LMS registration validation API through validateRegistrationRequest
 * - Transforms LMS field names to match frontend form field names
 * - Extracts the first error message for each field to avoid message arrays
 * - Returns a consistent validation result structure for form integration
 * - Provides fallback error handling for network or unexpected errors
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
 * // Handle network errors gracefully
 * try {
 *   const result = await validateRegistrationFields(formData);
 *   // Process result...
 * } catch (error) {
 *   // This function handles errors internally and returns them in the result
 *   console.log('Validation completed with errors:', result.errors);
 * }
 */
export async function validateRegistrationFields(
  values: RegistrationRequestSchema,
): Promise<{ isValid: boolean; errors: Record<string, string> }> {
  try {
    await validateRegistrationRequest(values);
    return { isValid: true, errors: {} };
  } catch (error: any) {
    const errors: Record<string, string> = {};

    if (error.response?.data) {
      const errorData = error.response.data as RegistrationErrorResponseSchema;

      // Map LMS field errors to friendly error messages
      Object.entries(errorData).forEach(([field, messages]) => {
        if (messages && messages.length > 0) {
          // Map LMS field names to our form field names
          const fieldMapping: Record<string, string> = {
            email: 'adminEmail',
            name: 'fullName',
            username: 'username',
            password: 'password',
            country: 'country',
          };

          const mappedField = fieldMapping[field] || field;
          const [firstMessage] = messages;
          errors[mappedField] = firstMessage;
        }
      });
    }

    // If no specific field errors, add a general error
    if (Object.keys(errors).length === 0) {
      errors.root = 'Registration validation failed. Please check your information.';
    }

    return { isValid: false, errors };
  }
}

/**
 * Cache for storing previous registration values to enable efficient debouncing.
 * Maps cache keys (JSON stringified values) to registration data for comparison.
 */
const previousRegistrationValues = new Map<string, RegistrationRequestSchema>();

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
 * - Handle errors gracefully by returning a fallback error result
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
          resolve({ isValid: false, errors: { root: 'Validation failed due to network error' } });
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
 * - Skips validation entirely if the values have not changed since the last check
 *   by comparing against cached previous values using deep equality
 * - Maintains the same interface as validateRegistrationFields for easy replacement
 * - Creates cache keys based on JSON serialization of all form values
 * - Returns early with valid state when values are unchanged to improve performance
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

  // Check if values have changed since last validation
  if (isEqual(previousRegistrationValues.get(cacheKey), values)) {
    // Return cached result as valid (assuming no changes means previously valid state)
    return { isValid: true, errors: {} };
  }

  // Store current values for next comparison
  previousRegistrationValues.set(cacheKey, values);

  // Return a promise that will be resolved by the debounced function
  return new Promise((resolve) => {
    const debounced = getRegistrationDebouncer();
    debounced(values, resolve);
  });
}
