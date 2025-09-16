import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform/config';
import { snakeCaseObject } from '@edx/frontend-platform/utils';
import { AxiosError, AxiosResponse } from 'axios';

import {
  createCheckoutSessionErrorResponseFactory,
  createCheckoutSessionRequestFactory,
  createCheckoutSessionSuccessResponseFactory,
} from '../__factories__/create-checkout-session-schema.factory';
import createCheckoutSession from '../checkout-session';

// Mock setup
jest.mock('@edx/frontend-platform/auth', () => ({
  getAuthenticatedHttpClient: jest.fn(),
}));

jest.mock('@edx/frontend-platform/config', () => ({
  getConfig: jest.fn(),
}));

describe('createCheckoutSession', () => {
  const mockPost = jest.fn();
  const mockConfig = {
    ENTERPRISE_ACCESS_BASE_URL: 'https://example.com',
  };
  const mockRequest = createCheckoutSessionRequestFactory();
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
    const mockSuccessResponse = {
      data: createCheckoutSessionSuccessResponseFactory(),
    } as AxiosResponse<CreateCheckoutSessionSuccessResponseSchema>;
    mockPost.mockResolvedValue(mockSuccessResponse);

    // Execute
    await createCheckoutSession(mockRequest);

    // Verify
    expect(getConfig).toHaveBeenCalled();
    expect(getAuthenticatedHttpClient).toHaveBeenCalled();
    expect(mockPost).toHaveBeenCalledWith(
      baseUrl,
      snakeCaseObject(mockRequest),
      expect.anything(), // axios config.
    );
  });

  it('should return the successful response from the API', async () => {
    // Setup
    const mockSuccessResponse = {
      data: createCheckoutSessionSuccessResponseFactory(),
    } as AxiosResponse<CreateCheckoutSessionSuccessResponseSchema>;
    mockPost.mockResolvedValue(mockSuccessResponse);

    // Execute
    const result: AxiosResponse<CreateCheckoutSessionSuccessResponseSchema> = await createCheckoutSession(mockRequest);

    // Verify the checkout session properties
    expect(result.data).toHaveProperty('checkoutSessionClientSecret');

    // Verify data types
    expect(typeof result.data.checkoutSessionClientSecret).toBe('string');
  });

  it('should handle validation error responses', async () => {
    // Setup - Create an error response with specific fields
    const mockError = new AxiosError<CreateCheckoutSessionErrorResponseSchema>(
      'Request failed with status code 422',
      'ERR_BAD_REQUEST',
      undefined,
      null,
      {
        data: createCheckoutSessionErrorResponseFactory(['adminEmail', 'enterpriseSlug']),
        status: 422,
        statusText: 'Unprocessable Entity',
      } as AxiosResponse<CreateCheckoutSessionErrorResponseSchema>,
    );
    mockPost.mockRejectedValueOnce(mockError);

    // Execute
    let thrownError: unknown;
    try {
      await createCheckoutSession(mockRequest);
    } catch (err) {
      thrownError = err;
    }

    // Verify an error has been thrown.
    expect(thrownError).toBeInstanceOf(AxiosError);
    const errorData = (thrownError as AxiosError)?.response?.data as CreateCheckoutSessionErrorResponseSchema;

    // Verify specific error fields
    expect(errorData).toHaveProperty('adminEmail');
    expect(errorData).toHaveProperty('enterpriseSlug');
    expect(errorData.adminEmail).toHaveProperty('errorCode');
    expect(errorData.adminEmail).toHaveProperty('developerMessage');
    expect(errorData.enterpriseSlug).toHaveProperty('errorCode');
    expect(errorData.enterpriseSlug).toHaveProperty('developerMessage');
  });
});
