import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { AxiosError, AxiosResponse } from 'axios';
import React from 'react';

import { createCheckoutIntent } from '@/components/app/data/services/checkout-intent';

import useCreateCheckoutIntentMutation from '../useCreateCheckoutIntentMutation';

// Mock createCheckoutIntent service
jest.mock('@/components/app/data/services/checkout-intent');

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

const createMockRequest = (overrides = {}) => ({
  quantity: 10,
  country: 'US',
  ...overrides,
});

const createMockSuccessResponse = (overrides = {}): AxiosResponse<CreateCheckoutIntentSuccessResponseSchema> => ({
  data: {
    id: 1,
    state: 'created',
    quantity: 10,
    ...overrides,
  },
  status: 201,
  statusText: 'Created',
  headers: {},
  config: {} as any,
});

const createMockErrorResponse = (overrides = {}): AxiosError<CreateCheckoutIntentErrorResponseSchema> => {
  const errorData: CreateCheckoutIntentErrorResponseSchema = {
    quantity: { errorCode: 'Too low' },
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

describe('useCreateCheckoutIntentMutation', () => {
  const mockCreateCheckoutIntent = createCheckoutIntent as jest.MockedFunction<typeof createCheckoutIntent>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call createCheckoutIntent and trigger onSuccess callback', async () => {
    const mockOnSuccess = jest.fn();
    const mockOnError = jest.fn();
    const mockRequestData = createMockRequest();
    const mockResponse = createMockSuccessResponse();

    mockCreateCheckoutIntent.mockResolvedValue(mockResponse);

    const { result } = renderHook(
      () => useCreateCheckoutIntentMutation({
        onSuccess: mockOnSuccess,
        onError: mockOnError,
      }),
      { wrapper: createWrapper() },
    );

    result.current.mutate(mockRequestData);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockCreateCheckoutIntent).toHaveBeenCalledWith(mockRequestData);
    expect(mockOnSuccess).toHaveBeenCalledWith(mockResponse.data);
    expect(mockOnError).not.toHaveBeenCalled();
  });

  it('should handle error and call onError callback with error data', async () => {
    const mockOnSuccess = jest.fn();
    const mockOnError = jest.fn();
    const mockRequestData = createMockRequest();
    const mockError = createMockErrorResponse();

    mockCreateCheckoutIntent.mockRejectedValue(mockError);

    const { result } = renderHook(
      () => useCreateCheckoutIntentMutation({
        onSuccess: mockOnSuccess,
        onError: mockOnError,
      }),
      { wrapper: createWrapper() },
    );

    result.current.mutate(mockRequestData);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(mockCreateCheckoutIntent).toHaveBeenCalledWith(mockRequestData);
    expect(mockOnError).toHaveBeenCalledWith(mockError.response?.data);
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  it('should forward additional mutation config options', async () => {
    const mockOnSuccess = jest.fn();
    const mockOnError = jest.fn();
    const mockOnMutate = jest.fn();
    const mockRequestData = createMockRequest();
    const mockResponse = createMockSuccessResponse();

    mockCreateCheckoutIntent.mockResolvedValue(mockResponse);

    const { result } = renderHook(
      () => useCreateCheckoutIntentMutation({
        onSuccess: mockOnSuccess,
        onError: mockOnError,
        onMutate: mockOnMutate,
        retry: 2,
      }),
      { wrapper: createWrapper() },
    );

    result.current.mutate(mockRequestData);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockOnMutate).toHaveBeenCalledWith(mockRequestData);
    expect(mockOnSuccess).toHaveBeenCalledWith(mockResponse.data);
  });

  it('should provide loading state during mutation', async () => {
    const mockOnSuccess = jest.fn();
    const mockOnError = jest.fn();
    const mockRequestData = createMockRequest();
    const mockResponse = createMockSuccessResponse();

    let resolveMutation: (value: any) => void;
    const mutationPromise = new Promise((resolve) => {
      resolveMutation = resolve;
    });

    mockCreateCheckoutIntent.mockReturnValue(mutationPromise as any);

    const { result } = renderHook(
      () => useCreateCheckoutIntentMutation({
        onSuccess: mockOnSuccess,
        onError: mockOnError,
      }),
      { wrapper: createWrapper() },
    );

    result.current.mutate(mockRequestData);

    await waitFor(() => {
      expect(result.current.isPending).toBe(true);
    });

    expect(result.current.isSuccess).toBe(false);
    expect(result.current.isError).toBe(false);

    resolveMutation!(mockResponse);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.isPending).toBe(false);
    expect(mockOnSuccess).toHaveBeenCalledWith(mockResponse.data);
  });
});
