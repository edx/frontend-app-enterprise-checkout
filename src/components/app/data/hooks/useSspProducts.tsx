import { useQuery, UseQueryResult } from '@tanstack/react-query';

import { querySspProducts } from '@/components/app/data/queries/queries';

import type { SspProduct } from '@/components/app/data/services/ssp-products';

const useSspProducts = (productKey: string): UseQueryResult<SspProduct[], Error> => {
  const queryInfo = querySspProducts(productKey);

  return useQuery({
    ...queryInfo,
    select: (response) => response.data || [],
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
};

export default useSspProducts;
