import { useMutation, UseMutationOptions } from '@tanstack/react-query';

import { createCheckoutIntent } from '@/components/app/data/services/checkout-intent';

import type { AxiosError, AxiosResponse } from 'axios';

interface UseCreateCheckoutIntentMutationProps extends Omit<
UseMutationOptions<
AxiosResponse<CreateCheckoutIntentSuccessResponseSchema>,
AxiosError<CreateCheckoutIntentErrorResponseSchema>,
CreateCheckoutIntentRequestSchema
>,
'mutationFn' | 'onSuccess' | 'onError'
> {
  onSuccess?: (data: CreateCheckoutIntentSuccessResponseSchema) => void;
  onError?: (errorData: CreateCheckoutIntentErrorResponseSchema | undefined) => void;
}

export default function useCreateCheckoutIntentMutation({
  onSuccess,
  onError,
  ...mutationConfig
}: UseCreateCheckoutIntentMutationProps = {}) {
  return useMutation<
  AxiosResponse<CreateCheckoutIntentSuccessResponseSchema>,
  AxiosError<CreateCheckoutIntentErrorResponseSchema>,
  CreateCheckoutIntentRequestSchema
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
