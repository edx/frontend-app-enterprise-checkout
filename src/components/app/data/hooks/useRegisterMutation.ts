import { useMutation } from '@tanstack/react-query';

import { registerRequest } from '@/components/app/data/services/registration';

import type { AxiosError, AxiosResponse } from 'axios';

interface UseRegisterMutationProps {
  onSuccess: (data: RegistrationCreateSuccessResponseSchema) => void;
  onError: (errorMessage: string, fieldErrors?: Partial<Record<keyof RegistrationCreateRequestSchema, string>>) => void;
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
      const data = axiosError?.response?.data as RegistrationErrorResponseSchema | undefined;
      let genericMessage = 'Registration failed';
      const fieldErrors: Partial<Record<keyof RegistrationCreateRequestSchema, string>> = {};

      if (data && typeof data === 'object') {
        // Extract first error from known fields if present
        const firstFieldWithError = (['email', 'name', 'username', 'password', 'country'] as const)
          .find((key) => Array.isArray((data as any)[key]) && (data as any)[key].length > 0);
        if (firstFieldWithError) {
          const firstMsg = ((data as any)[firstFieldWithError] as string[])[0];
          fieldErrors[firstFieldWithError] = firstMsg;
          genericMessage = firstMsg;
        }
        // Fallback to any string in values
        if (!firstFieldWithError) {
          const anyMsg = Object.values(data).find(
            (arr) => Array.isArray(arr) && arr.length > 0,
          )?.[0] as string | undefined;
          if (anyMsg) {
            genericMessage = anyMsg;
          }
        }
      }

      onError(genericMessage, fieldErrors);
    },
    ...mutationConfig,
  });
}
