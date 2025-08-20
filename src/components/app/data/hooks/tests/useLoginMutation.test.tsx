import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { AxiosError, AxiosResponse } from 'axios';
import React from 'react';

import loginRequest from '@/components/app/data/services/login';

import useLoginMutation from '../useLoginMutation';

// Mock the login service
jest.mock('@/components/app/data/services/login');

/**
 * Helper function to create a test wrapper with QueryClient
 */
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  return wrapper;
};

/**
 * Helper function to create a mock login request
 */
const createMockLoginRequest = (overrides = {}): LoginRequestSchema => ({
  emailOrUsername: 'test@example.com',
  password: 'password123',
  ...overrides,
});

/**
 * Helper function to create a mock successful response
 */
const createMockSuccessResponse = (overrides = {}): AxiosResponse<LoginSuccessResponseSchema> => ({
  data: {
    redirectUrl: '/dashboard',
    success: true,
    ...overrides,
  },
  status: 200,
  statusText: 'OK',
  headers: {},
  config: {} as any,
});

/**
 * Helper function to create a mock error response
 */
const createMockErrorResponse = (overrides = {}): AxiosError<LoginErrorResponseSchema> => {
  const errorData: LoginErrorResponseSchema = {
    nonFieldErrors: ['Invalid email or password'],
    ...overrides,
  };

  return new AxiosError(
    'Request failed with status code 400',
    '400',
    undefined,
    undefined,
    {
      status: 400,
      statusText: 'Bad Request',
      data: errorData,
      headers: {},
      config: {} as any,
    },
  );
};

describe('useLoginMutation', () => {
  const mockLoginRequest = loginRequest as jest.MockedFunction<typeof loginRequest>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully call loginRequest and trigger onSuccess callback', async () => {
    // Setup
    const mockOnSuccess = jest.fn();
    const mockOnError = jest.fn();
    const mockRequestData = createMockLoginRequest();
    const mockResponse = createMockSuccessResponse();

    mockLoginRequest.mockResolvedValue(mockResponse);

    // Execute
    const { result } = renderHook(
      () => useLoginMutation({
        onSuccess: mockOnSuccess,
        onError: mockOnError,
      }),
      { wrapper: createWrapper() },
    );

    result.current.mutate(mockRequestData);

    // Verify
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockLoginRequest).toHaveBeenCalledWith(mockRequestData);
    expect(mockOnSuccess).toHaveBeenCalledWith(mockResponse.data);
    expect(mockOnError).not.toHaveBeenCalled();
  });

  it('should handle error with non-field errors and trigger onError callback with default message', async () => {
    // Setup
    const mockOnSuccess = jest.fn();
    const mockOnError = jest.fn();
    const mockRequestData = createMockLoginRequest();
    const mockError = createMockErrorResponse({
      nonFieldErrors: ['Invalid credentials provided'],
    });

    mockLoginRequest.mockRejectedValue(mockError);

    // Execute
    const { result } = renderHook(
      () => useLoginMutation({
        onSuccess: mockOnSuccess,
        onError: mockOnError,
      }),
      { wrapper: createWrapper() },
    );

    result.current.mutate(mockRequestData);

    // Verify
    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(mockLoginRequest).toHaveBeenCalledWith(mockRequestData);
    expect(mockOnError).toHaveBeenCalledWith('Invalid credentials provided');
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  it('should handle error without response and use default error message', async () => {
    // Setup
    const mockOnSuccess = jest.fn();
    const mockOnError = jest.fn();
    const mockRequestData = createMockLoginRequest();
    const mockError = new AxiosError('Network Error');

    mockLoginRequest.mockRejectedValue(mockError);

    // Execute
    const { result } = renderHook(
      () => useLoginMutation({
        onSuccess: mockOnSuccess,
        onError: mockOnError,
      }),
      { wrapper: createWrapper() },
    );

    result.current.mutate(mockRequestData);

    // Verify
    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(mockLoginRequest).toHaveBeenCalledWith(mockRequestData);
    expect(mockOnError).toHaveBeenCalledWith('Invalid email or password');
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  it('should handle error without nonFieldErrors and use default message', async () => {
    // Setup
    const mockOnSuccess = jest.fn();
    const mockOnError = jest.fn();
    const mockRequestData = createMockLoginRequest();
    const mockError = createMockErrorResponse({
      email: ['This field is required.'],
      password: ['This field is required.'],
    });

    // Remove nonFieldErrors from the error
    delete mockError.response?.data.nonFieldErrors;

    mockLoginRequest.mockRejectedValue(mockError);

    // Execute
    const { result } = renderHook(
      () => useLoginMutation({
        onSuccess: mockOnSuccess,
        onError: mockOnError,
      }),
      { wrapper: createWrapper() },
    );

    result.current.mutate(mockRequestData);

    // Verify
    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(mockLoginRequest).toHaveBeenCalledWith(mockRequestData);
    expect(mockOnError).toHaveBeenCalledWith('Invalid email or password');
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  it('should forward additional mutation config options', async () => {
    // Setup
    const mockOnSuccess = jest.fn();
    const mockOnError = jest.fn();
    const mockOnMutate = jest.fn();
    const mockRequestData = createMockLoginRequest();
    const mockResponse = createMockSuccessResponse();

    mockLoginRequest.mockResolvedValue(mockResponse);

    // Execute
    const { result } = renderHook(
      () => useLoginMutation({
        onSuccess: mockOnSuccess,
        onError: mockOnError,
        onMutate: mockOnMutate,
        retry: 3,
      }),
      { wrapper: createWrapper() },
    );

    result.current.mutate(mockRequestData);

    // Verify
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockOnMutate).toHaveBeenCalledWith(mockRequestData);
    expect(mockOnSuccess).toHaveBeenCalledWith(mockResponse.data);
  });

  it('should provide loading state during mutation', async () => {
    // Setup
    const mockOnSuccess = jest.fn();
    const mockOnError = jest.fn();
    const mockRequestData = createMockLoginRequest();
    const mockResponse = createMockSuccessResponse();

    // Create a promise that we can control
    let resolveLogin: (value: any) => void;
    const loginPromise = new Promise((resolve) => {
      resolveLogin = resolve;
    });

    mockLoginRequest.mockReturnValue(loginPromise as any);

    // Execute
    const { result } = renderHook(
      () => useLoginMutation({
        onSuccess: mockOnSuccess,
        onError: mockOnError,
      }),
      { wrapper: createWrapper() },
    );

    // Start mutation
    result.current.mutate(mockRequestData);

    // Verify loading state
    await waitFor(() => {
      expect(result.current.isPending).toBe(true);
    });

    expect(result.current.isSuccess).toBe(false);
    expect(result.current.isError).toBe(false);

    // Resolve the promise
    resolveLogin!(mockResponse);

    // Verify final state
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.isPending).toBe(false);
    expect(mockOnSuccess).toHaveBeenCalledWith(mockResponse.data);
  });
});
