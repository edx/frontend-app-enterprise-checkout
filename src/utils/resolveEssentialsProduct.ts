// utils/resolveEssentialsProduct.ts

import type { SspProduct } from '@/components/app/data/services/ssp-products';

/**
 * Given the full list of SSP products from the API and a product key
 * (from the URL query param), return the best-matching product.
 *
 * Match priority:
 *  1. Exact match on lookupKey or slug
 *  2. Fuzzy match: lookupKey starts with 'essentials_' or slug includes 'essentials'
 *  3. First product in the list as last resort
 */
export function resolveEssentialsProduct(
  allProducts: SspProduct[],
  productKey: string,
): SspProduct | undefined {
  if (!allProducts.length) { return undefined; }

  // 1. Exact match
  const exactMatch = allProducts.find(
    (p) => (p.lookupKey || '') === productKey
      || (p.slug || '') === productKey,
  );
  if (exactMatch) { return exactMatch; }

  // 2. Fuzzy fallback
  return (
    allProducts.find((p) => {
      const lk = (p.lookupKey || '').toLowerCase();
      const slug = (p.slug || '').toLowerCase();
      return lk.startsWith('essentials_') || slug.includes('essentials');
    }) || allProducts[0]
  );
}
