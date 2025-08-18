import { useMutation } from '@tanstack/react-query';

import loginRequest from '@/components/app/data/services/login';

import type { AxiosError, AxiosResponse } from 'axios';

interface UseLoginMutationProps {
  onSuccess: (data: LoginSuccessResponseSchema) => void;
  onError: (errorMessage: string) => void;
  [key: string]: any;
}

/*
 * Provide a thin useMutation abstraction around loginRequest to protect the
 * caller from being aware of Axios.
 */
export default function useLoginMutation({
  onSuccess,
  onError,
  ...mutationConfig
}: UseLoginMutationProps) {
  return useMutation<
  AxiosResponse<LoginSuccessResponseSchema>,
  AxiosError<LoginErrorResponseSchema>,
  LoginRequestSchema
  >({
    mutationFn: (requestData) => loginRequest(requestData),
    onSuccess: (axiosResponse) => onSuccess(axiosResponse.data),
    onError: (axiosError) => {
      const errorMessage: string = axiosError?.response?.data?.nonFieldErrors?.[0] || 'Invalid email or password';
      onError(errorMessage);
    },
    ...mutationConfig,
  });
}
