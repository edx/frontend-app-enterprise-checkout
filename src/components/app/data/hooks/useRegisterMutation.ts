import { useMutation } from '@tanstack/react-query';

import { registerRequest } from '@/components/app/data/services/registration';

import type { AxiosError, AxiosResponse } from 'axios';

interface UseRegisterMutationProps {
  onSuccess: (data: RegistrationCreateSuccessResponseSchema) => void;
  onError: (errorMessage: string) => void;
  [key: string]: any;
}

/*
 * Provide a thin useMutation abstraction around registerRequest to protect the
 * caller from being aware of Axios.
 */
export default function useRegisterMutation({
  onSuccess,
  onError,
  ...mutationConfig
}: UseRegisterMutationProps) {
  return useMutation<
  AxiosResponse<RegistrationCreateSuccessResponseSchema>,
  AxiosError<RegistrationErrorResponseSchema>,
  RegistrationCreateRequestSchema
  >({
    mutationFn: (requestData) => registerRequest(requestData),
    onSuccess: (axiosResponse) => onSuccess(axiosResponse.data),
    onError: (axiosError) => {
      // Treat errors generically; do not parse field-level errors here since validation occurs earlier.
      const serverMessage = (
        (axiosError?.response?.data as any)?.detail
      ) || axiosError?.message || 'Registration failed';
      onError(serverMessage);
    },
    ...mutationConfig,
  });
}
