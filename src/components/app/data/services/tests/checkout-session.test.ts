import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform/config';

import {
  checkoutSessionResponseFactory,
  createCheckoutSessionErrorResponseFactory,
  createCheckoutSessionSchemaPayloadFactory,
} from '../__factories__/create-checkout-session-schema.factory';
import createCheckoutSession from '../checkout-session';

// Mock setup
jest.mock('@edx/frontend-platform/auth', () => ({
  getAuthenticatedHttpClient: jest.fn(),
}));

jest.mock('@edx/frontend-platform/config', () => ({
  getConfig: jest.fn(),
}));

/**
 * Helper function to verify the structure of a successful checkout session response
 */
const verifySuccessfulCheckoutSessionResponse = (response: CreateCheckoutSessionResponse): CreateCheckoutSessionResponse => {
  // Verify the checkout session properties
  expect(response).toHaveProperty('checkoutSessionClientSecret');

  // Verify data types
  expect(typeof response.checkoutSessionClientSecret).toBe('string');

  return response;
};

/**
 * Helper function to verify the structure of an error checkout session response
 */
const verifyErrorCheckoutSessionResponse = (response: CreateCheckoutSessionErrorResponse): CreateCheckoutSessionErrorResponse => {
  // Verify we have at least one error field
  const errorFields = Object.keys(response);
  expect(errorFields.length).toBeGreaterThan(0);

  // Verify each error field has the expected structure
  errorFields.forEach(field => {
    expect(response[field]).toHaveProperty('errorCode');
    expect(response[field]).toHaveProperty('developerMessage');
    expect(typeof response[field].errorCode).toBe('string');
    expect(typeof response[field].developerMessage).toBe('string');
  });

  return response;
};

describe('createCheckoutSession', () => {
  const mockPost = jest.fn();
  const mockConfig = {
    ENTERPRISE_ACCESS_BASE_URL: 'https://example.com',
  };
  const mockPayload = createCheckoutSessionSchemaPayloadFactory();
  const baseUrl = 'https://example.com/api/v1/customer-billing/create-checkout-session/';

  beforeEach(() => {
    jest.clearAllMocks();
    (getAuthenticatedHttpClient as jest.Mock).mockReturnValue({
      post: mockPost,
    });
    (getConfig as jest.Mock).mockReturnValue(mockConfig);
  });

  it('should call the correct URL with the correct payload', async () => {
    // Setup
    const mockSuccessResponse: { data: CreateCheckoutSessionResponse } = {
      data: checkoutSessionResponseFactory(),
    };
    mockPost.mockResolvedValue(mockSuccessResponse);

    // Execute
    await createCheckoutSession(mockPayload);

    // Verify
    expect(getConfig).toHaveBeenCalled();
    expect(getAuthenticatedHttpClient).toHaveBeenCalled();
    expect(mockPost).toHaveBeenCalledWith(baseUrl, mockPayload);
  });

  it('should return the successful response from the API', async () => {
    // Setup
    const mockSuccessResponse: { data: CreateCheckoutSessionResponse } = {
      data: checkoutSessionResponseFactory(),
    };
    mockPost.mockResolvedValue(mockSuccessResponse);

    // Execute
    const result = await createCheckoutSession(mockPayload) as CreateCheckoutSessionResponse;

    // Verify
    verifySuccessfulCheckoutSessionResponse(result);
  });

  it('should handle validation error responses', async () => {
    // Setup - Create an error response with specific fields
    const mockErrorResponse: {
      data: Partial<CreateCheckoutSessionErrorResponse>;
      status: number;
      statusText: string;
    } = {
      data: createCheckoutSessionErrorResponseFactory(['adminEmail', 'enterpriseSlug']),
      status: 422,
      statusText: 'Unprocessable Entity',
    };
    mockPost.mockResolvedValue(mockErrorResponse);

    // Execute
    const result = await createCheckoutSession(mockPayload) as CreateCheckoutSessionErrorResponse;

    // Verify
    verifyErrorCheckoutSessionResponse(result);

    // Verify specific error fields
    expect(result).toHaveProperty('adminEmail');
    expect(result).toHaveProperty('enterpriseSlug');
    expect(result.adminEmail).toHaveProperty('errorCode');
    expect(result.adminEmail).toHaveProperty('developerMessage');
    expect(result.enterpriseSlug).toHaveProperty('errorCode');
    expect(result.enterpriseSlug).toHaveProperty('developerMessage');
  });

  it('should handle specific validation error types', async () => {
    // Setup - Create a custom error response with specific error codes and messages
    const customErrorResponse: Partial<CheckoutSessionResponseTypePayload> = {
      admin_email: {
        error_code: 'not_registered',
        developer_message: 'The provided email has not yet been registered.',
      },
      enterprise_slug: {
        error_code: 'existing_enterprise_customer',
        developer_message: 'Slug conflicts with existing customer.',
      },
    };

    mockPost.mockResolvedValue({
      data: customErrorResponse,
      status: 422,
      statusText: 'Unprocessable Entity',
    });

    // Execute
    const result = await createCheckoutSession(mockPayload) as CreateCheckoutSessionErrorResponse;

    // Verify
    expect(result.adminEmail.errorCode).toBe('not_registered');
    expect(result.adminEmail.developerMessage).toMatch(/not yet been registered/i);

    expect(result.enterpriseSlug.errorCode).toBe('existing_enterprise_customer');
    expect(result.enterpriseSlug.developerMessage).toMatch(/conflicts with existing customer/i);
  });

  it('should throw an error if the API call fails', async () => {
    // Setup
    const mockError: Error = new Error('API call fails');
    mockPost.mockRejectedValue(mockError);

    // Execute & Verify
    await expect(createCheckoutSession(mockPayload)).rejects.toThrow('API call fails');
  });
});
