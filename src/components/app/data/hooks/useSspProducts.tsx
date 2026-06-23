import { getConfig } from '@edx/frontend-platform/config';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export type SspProduct = {
  name?: string;
  long_name?: string;
  description?: string;
  marketing_url?: string | null;
  thumbnail_url?: string | null;
  price?: string | null;
  lookup_key?: string | null;
  slug?: string | null;
};

export const fetchSspProducts = async (): Promise<SspProduct[]> => {
  const { ENTERPRISE_ACCESS_BASE_URL } = getConfig();
  const url = `${ENTERPRISE_ACCESS_BASE_URL}/api/v1/ssp-products`;

  try {
    const { data } = await axios.get(url);

    if (!Array.isArray(data)) {
      return [];
    }

    return data as SspProduct[];
  } catch {
    return [];
  }
};

const useSspProducts = () => useQuery({
  queryKey: ['ssp-products'],
  queryFn: fetchSspProducts,
  staleTime: 5 * 60 * 1000,
});

export default useSspProducts;
