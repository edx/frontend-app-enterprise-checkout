import { useMutation, UseMutationOptions } from '@tanstack/react-query';

import createCheckoutSession from '@/components/app/data/services/checkout-session';

import type { AxiosError, AxiosResponse } from 'axios';

type MutationSuccess = AxiosResponse<CreateCheckoutSessionSuccessResponseSchema>;
type MutationError = AxiosError<CreateCheckoutSessionErrorResponseSchema>;
type MutationData = CreateCheckoutSessionRequestSchema;

interface UseCreateCheckoutSessionMutationProps
  extends Omit<
  UseMutationOptions<MutationSuccess, MutationError, MutationData>,
  'mutationFn' | 'onSuccess' | 'onError'
  > {
  onSuccess: (data: CreateCheckoutSessionSuccessResponseSchema) => void;
  onError: (fieldErrors: CreateCheckoutSessionErrorResponseSchema | undefined) => void;
}

export default function useCreateCheckoutSessionMutation({
  onSuccess,
  onError,
  ...mutationConfig
}: UseCreateCheckoutSessionMutationProps) {
  return useMutation<MutationSuccess, MutationError, MutationData>({
    mutationFn: (requestData) => createCheckoutSession(requestData),
    onSuccess: (axiosResponse) => onSuccess(axiosResponse.data),
    onError: (axiosError) => onError(axiosError.response?.data),
    ...mutationConfig,
  });
}
