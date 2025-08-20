import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform/config';
import { AxiosError, AxiosResponse } from 'axios';

import loginRequest from '../login';

// Mock setup
jest.mock('@edx/frontend-platform/auth', () => ({
  getAuthenticatedHttpClient: jest.fn(),
}));

jest.mock('@edx/frontend-platform/config', () => ({
  getConfig: jest.fn(),
}));

/**
 * Helper function to create a mock login request payload
 */
const createMockLoginRequest = (overrides = {}): LoginRequestSchema => ({
  emailOrUsername: 'test@example.com',
  password: 'password123',
  ...overrides,
});

/**
 * Helper function to create a mock successful login response
 */
const createMockSuccessResponse = (overrides = {}): LoginSuccessResponseSchema => ({
  redirectUrl: '/dashboard',
  success: true,
  ...overrides,
});

/**
 * Helper function to create a mock error response
 */
const createMockErrorResponse = (overrides = {}): LoginErrorResponseSchema => ({
  nonFieldErrors: ['Invalid email or password'],
  ...overrides,
});

/**
 * Helper function to verify the structure of a successful login response
 */
const verifySuccessfulLoginResponse = (response: AxiosResponse<LoginSuccessResponseSchema>): void => {
  expect(response.data).toHaveProperty('redirectUrl');
  expect(response.data).toHaveProperty('success');
  expect(typeof response.data.redirectUrl).toBe('string');
  expect(typeof response.data.success).toBe('boolean');
  expect(response.data.success).toBe(true);
};

describe('loginRequest', () => {
  const mockPost = jest.fn();
  const mockConfig = {
    LMS_BASE_URL: 'https://example.com',
  };
  const baseUrl = 'https://example.com/api/user/v2/account/login_session/';

  beforeEach(() => {
    jest.clearAllMocks();
    (getAuthenticatedHttpClient as jest.Mock).mockReturnValue({
      post: mockPost,
    });
    (getConfig as jest.Mock).mockReturnValue(mockConfig);
  });

  it('should call the correct URL with the correct payload and headers', async () => {
    // Setup
    const mockRequestData = createMockLoginRequest();
    const mockSuccessResponse = {
      data: createMockSuccessResponse(),
    };
    mockPost.mockResolvedValue(mockSuccessResponse);

    // Execute
    await loginRequest(mockRequestData);

    // Verify
    expect(getConfig).toHaveBeenCalled();
    expect(getAuthenticatedHttpClient).toHaveBeenCalled();
    expect(mockPost).toHaveBeenCalledWith(
      baseUrl,
      'email_or_username=test%40example.com&password=password123',
      expect.objectContaining({
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        isPublic: true,
        transformResponse: expect.any(Array),
      }),
    );
  });

  it('should return a successful response from the API', async () => {
    // Setup
    const mockRequestData = createMockLoginRequest();
    const mockSuccessResponse = {
      data: createMockSuccessResponse(),
    };
    mockPost.mockResolvedValue(mockSuccessResponse);

    // Execute
    const result = await loginRequest(mockRequestData);

    // Verify
    verifySuccessfulLoginResponse(result);
    expect(result.data.redirectUrl).toBe('/dashboard');
    expect(result.data.success).toBe(true);
  });

  it('should handle different successful response data', async () => {
    // Setup
    const mockRequestData = createMockLoginRequest({
      emailOrUsername: 'user@test.com',
    });
    const mockSuccessResponse = {
      data: createMockSuccessResponse({
        redirectUrl: '/custom-redirect',
        success: true,
      }),
    };
    mockPost.mockResolvedValue(mockSuccessResponse);

    // Execute
    const result = await loginRequest(mockRequestData);

    // Verify
    verifySuccessfulLoginResponse(result);
    expect(result.data.redirectUrl).toBe('/custom-redirect');
  });

  it('should throw AxiosError with non-field errors when login fails', async () => {
    // Setup
    const mockRequestData = createMockLoginRequest({
      emailOrUsername: 'invalid@example.com',
      password: 'wrongpassword',
    });
    const mockErrorResponse = createMockErrorResponse({
      nonFieldErrors: ['Invalid email or password'],
    });

    const axiosError = new AxiosError(
      'Request failed with status code 400',
      '400',
      undefined,
      undefined,
      {
        status: 400,
        statusText: 'Bad Request',
        data: mockErrorResponse,
        headers: {},
        config: {},
      } as AxiosResponse<LoginErrorResponseSchema>,
    );

    mockPost.mockRejectedValue(axiosError);

    // Execute & Verify
    await expect(loginRequest(mockRequestData)).rejects.toThrow(AxiosError);
    await expect(loginRequest(mockRequestData)).rejects.toMatchObject({
      response: {
        status: 400,
        data: {
          nonFieldErrors: ['Invalid email or password'],
        },
      },
    });
  });

  it('should throw AxiosError with field-specific errors', async () => {
    // Setup
    const mockRequestData = createMockLoginRequest({
      emailOrUsername: '',
      password: '',
    });
    const mockErrorResponse = createMockErrorResponse({
      email: ['This field is required.'],
      password: ['This field is required.'],
    });

    const axiosError = new AxiosError(
      'Request failed with status code 400',
      '400',
      undefined,
      undefined,
      {
        status: 400,
        statusText: 'Bad Request',
        data: mockErrorResponse,
        headers: {},
        config: {},
      } as AxiosResponse<LoginErrorResponseSchema>,
    );

    mockPost.mockRejectedValue(axiosError);

    // Execute & Verify
    await expect(loginRequest(mockRequestData)).rejects.toThrow(AxiosError);
    await expect(loginRequest(mockRequestData)).rejects.toMatchObject({
      response: {
        data: {
          email: ['This field is required.'],
          password: ['This field is required.'],
        },
      },
    });
  });

  it('should throw an error if the API call fails with network error', async () => {
    // Setup
    const mockRequestData = createMockLoginRequest();
    const mockError = new Error('Network error');
    mockPost.mockRejectedValue(mockError);

    // Execute & Verify
    await expect(loginRequest(mockRequestData)).rejects.toThrow('Network error');
  });
});
