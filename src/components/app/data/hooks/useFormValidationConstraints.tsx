import { UseQueryResult } from '@tanstack/react-query';

import useBFFContext from '@/components/app/data/hooks/useBFFContext';

/**
 * React hook: Retrieves form validation constraints from the BFF context.
 *
 * @returns {UseQueryResult<CheckoutContextFieldConstraints | null>} A TanStack Query result whose
 *   `data` contains the field constraints (when available) or `null`.
 */
const useFormValidationConstraints = (): UseQueryResult<CheckoutContextFieldConstraints | null> => {
  const constraints = useBFFContext<CheckoutContextFieldConstraints | null>(
    null,
    {
      select: (data: CheckoutContextResponse): CheckoutContextFieldConstraints | null => {
        if (data.fieldConstraints) {
          return data.fieldConstraints;
        }
        return null;
      },
    },
  );
  return constraints;
};

export default useFormValidationConstraints;
