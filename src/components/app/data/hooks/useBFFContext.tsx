import { queryOptions, useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';

import { queryBffContext } from '@/components/app/data/queries/queries';

// Generic wrapper around the BFF context query with correct typings
// TQueryFnData is fixed to CheckoutContextResponse since that's what the queryFn returns
// TData allows callers to map via `select` to a different shape
const useBFFContext = <TData = CheckoutContextResponse, TError = Error>(
  options?: Partial<UseQueryOptions<CheckoutContextResponse, TError, TData>>,
): UseQueryResult<TData, TError> => useQuery(
    queryOptions({
      ...queryBffContext(),
      ...options,
    }),
  );

export default useBFFContext;
