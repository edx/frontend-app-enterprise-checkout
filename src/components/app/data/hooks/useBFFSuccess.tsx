import { queryOptions, useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';

import { queryBffSuccess } from '@/components/app/data/queries/queries';

/**
 * React hook: Query the BFF checkout context with strong typings.
 *
 * TQueryFnData is fixed to CheckoutContextResponse since the underlying queryFn returns that shape.
 * TData allows callers to transform the data (e.g., via TanStack Query's `select`) into a different shape.
 *
 * @typeParam TData - The transformed data type returned by the hook (default: CheckoutContextResponse).
 * @typeParam TError - Error type (default: Error).
 * @param lmsUserId
 * @param {Partial<UseQueryOptions<CheckoutContextResponse, TError, TData>>} [options]
 *   TanStack Query options such as `select`, `staleTime`, etc. Spread into the generated queryOptions.
 * @returns {UseQueryResult<TData, TError>} A TanStack Query result for the BFF checkout context.
 */
const useBFFSuccess = <TData = CheckoutContextResponse, TError = Error>(
  lmsUserId: number | null = null,
  options?: Partial<UseQueryOptions<CheckoutContextResponse, TError, TData>>,
): UseQueryResult<TData, TError> => useQuery(
    queryOptions({
      ...queryBffSuccess(lmsUserId),
      ...options,
    }),
  );

export default useBFFSuccess;
