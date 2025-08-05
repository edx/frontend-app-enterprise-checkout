import { snakeCaseObject } from '@edx/frontend-platform';
import { useMutation } from '@tanstack/react-query';

import fetchCheckoutValidation from '@/components/app/data/services/validation';

const useValidate = () => useMutation({
  mutationFn: async (formData: ValidationSchema) => {
    try {
      const snakeCasedFormData = snakeCaseObject(formData);
      const response = fetchCheckoutValidation(snakeCasedFormData);
      console.log(response);
    } catch (e) {
      console.error(e);
    }
  },
  onSuccess: async (data) => {
    console.log({ data }, 'success');
  },
});

export default useValidate;
