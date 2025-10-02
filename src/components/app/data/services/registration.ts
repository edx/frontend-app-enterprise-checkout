import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform/config';
import { camelCaseObject, snakeCaseObject } from '@edx/frontend-platform/utils';

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
 * Registration validation service that calls the LMS registration endpoint for validation.
 * This performs validation only and does not actually create accounts.
 *
 * @param requestData - Registration data to validate
 * @returns Promise that resolves to validation result
 * @throws {AxiosError<RegistrationErrorResponseSchema>}
 */
export default async function validateRegistrationRequest(
  requestData: RegistrationRequestSchema,
): Promise<AxiosResponse<RegistrationSuccessResponseSchema>> {
  const requestPayload: RegistrationRequestPayload = snakeCaseObject(requestData);
  const requestConfig = {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    // Avoid eagerly intercepting the call to refresh the JWT token---it won't work so don't even try.
    isPublic: true,
    // Convert response payload (success or error) to a response schema for use by callers.
    transformResponse: [
      (data: RegistrationResponsePayload): RegistrationResponseSchema => camelCaseObject(data),
    ],
  };
  const response: AxiosResponse<RegistrationSuccessResponseSchema> = (
    await getAuthenticatedHttpClient().post<RegistrationSuccessResponsePayload>(
      `${getConfig().LMS_BASE_URL}/user_api/v1/account/registration/`,
      (new URLSearchParams(requestPayload)).toString(),
      requestConfig,
    )
  );
  return response;
}

/**
 * Helper function to validate registration fields and return structured errors
 *
 * @param values - Registration form values to validate
 * @returns Promise with validation result and mapped errors
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
          const [firstMessage] = messages; // Use first error message
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
