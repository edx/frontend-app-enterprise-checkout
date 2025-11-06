import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { AxiosError, AxiosResponse } from 'axios';
import React from 'react';

import { registerRequest } from '@/components/app/data/services/registration';

import useRegisterMutation from '../useRegisterMutation';

// Mock the registration service (named export)
jest.mock('@/components/app/data/services/registration', () => ({
  registerRequest: jest.fn(),
}));

/**
 * Helper to create a test wrapper with React Query client
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
 * Helper to create a mock register request payload
 */
const createMockRegisterRequest = (overrides = {}): Partial<RegistrationCreateRequestSchema> => ({
  name: 'John Doe',
  username: 'johndoe',
  password: 'Password123!',
  email: 'john@example.com',
  country: 'US',
  ...overrides,
});

/**
 * Helper to create a mock successful Axios response
 */
const createMockSuccessResponse = (overrides = {}): AxiosResponse<RegistrationCreateSuccessResponseSchema> => ({
  data: {
    success: true,
    ...overrides,
  },
  status: 200,
  statusText: 'OK',
  headers: {},
  config: {} as any,
});

/**
 * Helper to create a mock Axios error response
 */
const createMockErrorResponse = (data: any = {}, status = 400, message = 'Request failed with status code 400') => (
  new AxiosError(
    message,
    String(status),
    undefined,
    undefined,
    {
      status,
      statusText: 'Bad Request',
      data,
      headers: {},
      config: {} as any,
    },
  )
);

/**
 * Small helper to render the hook with default handlers and request data
 */
const renderUseRegister = (config: any = {}) => {
  const onSuccess = jest.fn();
  const onError = jest.fn();
  const requestData = createMockRegisterRequest();
  const utils = renderHook(
    () => useRegisterMutation({ onSuccess, onError, ...config }),
    { wrapper: createWrapper() },
  );
  return { ...utils, onSuccess, onError, requestData };
};

describe('useRegisterMutation', () => {
  const mockRegisterRequest = registerRequest as jest.MockedFunction<typeof registerRequest>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('successfully calls registerRequest and triggers onSuccess', async () => {
    const mockResponse = createMockSuccessResponse();
    mockRegisterRequest.mockResolvedValue(mockResponse);

    const { result, onSuccess, onError, requestData } = renderUseRegister();

    result.current.mutate(requestData);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockRegisterRequest).toHaveBeenCalledWith(requestData);
    expect(onSuccess).toHaveBeenCalledWith(mockResponse.data);
    expect(onError).not.toHaveBeenCalled();
  });

  describe('error handling', () => {
    type Case = [title: string, errorFactory: () => unknown, expectedMessage: string];

    it.each<Case>([
      [
        'error with response.detail',
        () => createMockErrorResponse({ detail: 'Email already exists' }),
        'Email already exists',
      ],
      [
        'network error without response',
        () => new AxiosError('Network Error'),
        'Network Error',
      ],
      [
        'error with response but no detail',
        () => createMockErrorResponse({}),
        'Request failed with status code 400',
      ],
    ])('handles %s and calls onError with expected message', async (_title, makeError, expectedMessage) => {
      const error = makeError();
      mockRegisterRequest.mockRejectedValue(error);

      const { result, onSuccess, onError, requestData } = renderUseRegister();

      result.current.mutate(requestData);

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(mockRegisterRequest).toHaveBeenCalledWith(requestData);
      expect(onError).toHaveBeenCalledWith(expectedMessage);
      expect(onSuccess).not.toHaveBeenCalled();
    });
  });

  it('forwards additional mutation config options', async () => {
    const mockOnMutate = jest.fn();
    const mockResponse = createMockSuccessResponse();

    mockRegisterRequest.mockResolvedValue(mockResponse);

    const { result, onSuccess, requestData } = renderUseRegister({ onMutate: mockOnMutate, retry: 2 });

    result.current.mutate(requestData);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockOnMutate).toHaveBeenCalledWith(requestData);
    expect(onSuccess).toHaveBeenCalledWith(mockResponse.data);
  });

  it('provides loading state during mutation', async () => {
    const mockResponse = createMockSuccessResponse();

    // Deferred promise to control resolution timing
    let resolveRegister: (value: any) => void;
    const registerPromise = new Promise((resolve) => {
      resolveRegister = resolve;
    });

    mockRegisterRequest.mockReturnValue(registerPromise as any);

    const { result, onSuccess, requestData } = renderUseRegister();

    result.current.mutate(requestData);

    await waitFor(() => {
      expect(result.current.isPending).toBe(true);
    });

    expect(result.current.isSuccess).toBe(false);
    expect(result.current.isError).toBe(false);

    resolveRegister!(mockResponse);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.isPending).toBe(false);
    expect(onSuccess).toHaveBeenCalledWith(mockResponse.data);
  });
});
