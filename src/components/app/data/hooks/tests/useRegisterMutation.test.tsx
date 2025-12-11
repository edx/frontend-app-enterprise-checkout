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

const createMockErrorResponse = (overrides = {}, status = 400): AxiosResponse<any> => ({
  data: {},
  ...overrides,
  status,
  statusText: 'Unimportant',
  headers: {},
  config: {} as any,
});

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
    type Case = [
      title: string,
      errorFactory: () => unknown,
      expectedMessage: [string, { detail?: string } | undefined],
    ];

    it.each<Case>([
      [
        'error with response.data.detail',
        () => createMockErrorResponse({ response: { data: { detail: 'Error response detail' } } }),
        ['Error response detail', {}],
      ], [
        'network error without response',
        () => new AxiosError('Network Error', '500'),
        ['Network Error', undefined],
      ], [
        'network error without response or message',
        () => new AxiosError(undefined, '500'),
        ['Registration failed', undefined],
      ], [
        'error with data but no response or message',
        () => createMockErrorResponse({ data: { detail: 'Error response detail' } }),
        ['Registration failed', { detail: 'Error response detail' }],
      ],
    ])('handles %s and calls onError with expected message', async (_title, makeError, expectedMessages) => {
      const error = makeError();
      mockRegisterRequest.mockRejectedValue(error);

      const { result, onSuccess, onError, requestData } = renderUseRegister();

      result.current.mutate(requestData);

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(mockRegisterRequest).toHaveBeenCalledWith(requestData);
      expect(onError).toHaveBeenCalledWith(...expectedMessages);
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
