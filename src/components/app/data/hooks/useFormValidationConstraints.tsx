import { AppContext } from '@edx/frontend-platform/react';
import { UseQueryResult } from '@tanstack/react-query';
import { useContext } from 'react';

import useBFFContext from '@/components/app/data/hooks/useBFFContext';

/**
 * React hook: Retrieves form validation constraints from the BFF context.
 *
 * @returns {UseQueryResult<CheckoutContextFieldConstraints | null>} A TanStack Query result whose
 *   `data` contains the field constraints (when available) or `null`.
 */
const useFormValidationConstraints = (): UseQueryResult<CheckoutContextFieldConstraints | null> => {
  const { authenticatedUser }: AppContextValue = useContext(AppContext);
  const constraints = useBFFContext<CheckoutContextFieldConstraints | null>(
    authenticatedUser?.userId ?? null,
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
