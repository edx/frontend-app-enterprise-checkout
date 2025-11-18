import { useMutation, UseMutationOptions } from '@tanstack/react-query';

import { createCheckoutIntent } from '@/components/app/data/services/checkout-intent';

import type { AxiosError, AxiosResponse } from 'axios';

interface UseCreateCheckoutIntentMutationProps extends Omit<
UseMutationOptions<
AxiosResponse<CheckoutIntentCreateSuccessResponseSchema>,
AxiosError<CheckoutIntentCreateErrorResponseSchema>,
CheckoutIntentCreateRequestSchema
>,
'mutationFn' | 'onSuccess' | 'onError'
> {
  onSuccess?: (data: CheckoutIntentCreateSuccessResponseSchema) => void;
  onError?: (errorData: CheckoutIntentCreateErrorResponseSchema | undefined) => void;
}

export default function useCreateCheckoutIntentMutation({
  onSuccess,
  onError,
  ...mutationConfig
}: UseCreateCheckoutIntentMutationProps = {}) {
  return useMutation<
  AxiosResponse<CheckoutIntentCreateSuccessResponseSchema>,
  AxiosError<CheckoutIntentCreateErrorResponseSchema>,
  CheckoutIntentCreateRequestSchema
  >({
    mutationFn: (requestData) => createCheckoutIntent(requestData),
    onSuccess: (axiosResponse) => {
      onSuccess?.(axiosResponse.data);
    },
    onError: (axiosError) => {
      onError?.(axiosError.response?.data);
    },
    ...mutationConfig,
  });
}
