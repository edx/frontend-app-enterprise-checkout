import { useMutation } from '@tanstack/react-query';

import { registerRequest } from '@/components/app/data/services/registration';

import type { AxiosError, AxiosResponse } from 'axios';

interface UseRegisterMutationProps {
  onSuccess: (data: RegistrationCreateSuccessResponseSchema) => void;
  onError: (errorMessage: string, errorData?: RegistrationErrorPayload) => void;
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
  AxiosResponse<RegistrationCreateSuccessResponseSchema> | AxiosResponse<RegistrationErrorResponseSchema>,
  Partial<RegistrationErrorResponseSchema> | AxiosError<any>,
  Partial<RegistrationCreateRequestSchema>
  >({
    mutationFn: (requestData) => registerRequest(requestData),
    onSuccess: (axiosResponse) => onSuccess(axiosResponse.data),
    onError: (axiosError) => {
      // Treat errors generically; do not parse field-level errors here since validation occurs earlier.
      const serverMessage = (
        axiosError?.response?.data?.detail
      ) || axiosError?.message || 'Registration failed';
      const errorData = (axiosError as AxiosResponse<RegistrationErrorResponseSchema>)?.data;
      // @ts-ignore Getting spurious error 2559
      onError(serverMessage, errorData);
    },
    ...mutationConfig,
  });
}
