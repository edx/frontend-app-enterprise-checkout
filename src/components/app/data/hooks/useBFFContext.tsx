import { queryOptions, useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';

import { queryBffContext } from '@/components/app/data/queries/queries';

/**
 * React hook: Query the BFF checkout context with strong typings.
 *
 * TQueryFnData is fixed to CheckoutContextResponse since the underlying queryFn returns that shape.
 * TData allows callers to transform the data (e.g., via TanStack Query's `select`) into a different shape.
 *
 * @typeParam TData - The transformed data type returned by the hook (default: CheckoutContextResponse).
 * @typeParam TError - Error type (default: Error).
 * @param {Partial<UseQueryOptions<CheckoutContextResponse, TError, TData>>} [options]
 *   TanStack Query options such as `select`, `staleTime`, etc. Spread into the generated queryOptions.
 * @returns {UseQueryResult<TData, TError>} A TanStack Query result for the BFF checkout context.
 */
const useBFFContext = <TData = CheckoutContextResponse, TError = Error>(
  options?: Partial<UseQueryOptions<CheckoutContextResponse, TError, TData>>,
): UseQueryResult<TData, TError> => useQuery(
    queryOptions({
      ...queryBffContext(),
      ...options,
    }),
  );

export default useBFFContext;
