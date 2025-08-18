import { UseQueryResult } from '@tanstack/react-query';

import useBFFContext from '@/components/app/data/hooks/useBFFContext';

const useFormValidationConstraints = (): UseQueryResult<CheckoutContextFieldConstraints | null> => {
  const constraints = useBFFContext<CheckoutContextFieldConstraints | null>({
    select: (data: CheckoutContextResponse): CheckoutContextFieldConstraints | null => {
      if (data.fieldConstraints) {
        return data.fieldConstraints;
      }
      return null;
    },
  });
  return constraints;
};

export default useFormValidationConstraints;
