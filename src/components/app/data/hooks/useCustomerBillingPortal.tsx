import { AppContext } from '@edx/frontend-platform/react';
import { queryOptions, useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { useContext } from 'react';

import { queryCustomerBillingPortal } from '@/components/app/data/queries/queries';

/**
 * useCustomerBillingPortal is a custom hook that queries the customer billing portal data
 * for a logged-in user.
 *
 * @param {Partial<UseQueryOptions>} options - Optional parameters to customize the query behavior.
 * @returns {UseQueryResult} The result object containing the status, data, error, and other query details.
 */
const useCustomerBillingPortal = (
  options: Partial<UseQueryOptions>,
):UseQueryResult => {
  const { authenticatedUser }: AppContextValue = useContext(AppContext);
  return useQuery(
    queryOptions({
      ...queryCustomerBillingPortal(authenticatedUser.userId),
      ...options,
    }),
  );
};

export default useCustomerBillingPortal;
