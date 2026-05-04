interface EssentialsAcademyProductPriceResponse {
  id: string;
  product: string;
  lookup_key: string;
  recurring: {
    interval: string;
    interval_count: number;
    usage_type: string;
  };
  currency: string;
  unit_amount: number;
  unit_amount_decimal: string;
}

interface EssentialsAcademyProductResponse {
  id: string;
  name: string;
  long_name: string;
  description: string;
  marketing_url: string;
  thumbnail_url: string;
  prices: EssentialsAcademyProductPriceResponse[];
  tags: string[];
  stripe_product_id: string;
  enterprise_catalog_uuid: string | null;
  edx_catalog_id: string | null;
}

export interface EssentialsAcademyData {
  id: string;
  slug: string;
  name: string;
  description: string;
  tags: string[];
  courseCount?: number;
  marketingUrl: string;
  price: {
    id: string;
    lookupKey: string;
    unitAmount: number;
    unitAmountDecimal: string;
    currency: string;
  } | null;
}

const PRODUCT_NAME_PREFIX = 'EDX course library subscription - essentials - ';
const PRODUCT_NAME_SUFFIX = ' Academy';

const MOCK_ESSENTIALS_ACADEMY_PRODUCTS_RESPONSE: EssentialsAcademyProductResponse[] = [
  {
    id: 'prod_UNidK6YYXneBxb',
    name: 'EDX course library subscription - essentials - Artificial Intelligence Academy',
    long_name: 'EDX course library subscription - essentials - Artificial Intelligence Academy',
    description: '',
    marketing_url: '',
    thumbnail_url: '',
    prices: [{
      id: 'price_1TOxCRF2SZotNMi0GcLU1ada',
      product: 'prod_UNidK6YYXneBxb',
      lookup_key: 'essentials_artificial_intelligence_academy_yearly',
      recurring: {
        interval: 'year',
        interval_count: 1,
        usage_type: 'licensed',
      },
      currency: 'usd',
      unit_amount: 14900,
      unit_amount_decimal: '149.00',
    }],
    tags: [],
    stripe_product_id: 'prod_UNidK6YYXneBxb',
    enterprise_catalog_uuid: null,
    edx_catalog_id: null,
  },
  {
    id: 'prod_UNidFP1YGSpPuQ',
    name: 'EDX course library subscription - essentials - Management Academy',
    long_name: 'EDX course library subscription - essentials - Management Academy',
    description: '',
    marketing_url: '',
    thumbnail_url: '',
    prices: [{
      id: 'price_1TOxCRF2SZotNMi0Gkmnx5qL',
      product: 'prod_UNidFP1YGSpPuQ',
      lookup_key: 'essentials_management_academy_yearly',
      recurring: {
        interval: 'year',
        interval_count: 1,
        usage_type: 'licensed',
      },
      currency: 'usd',
      unit_amount: 14900,
      unit_amount_decimal: '149.00',
    }],
    tags: [],
    stripe_product_id: 'prod_UNidFP1YGSpPuQ',
    enterprise_catalog_uuid: null,
    edx_catalog_id: null,
  },
  {
    id: 'prod_UNidZv2H9p2FID',
    name: 'EDX course library subscription - essentials - Communication Academy',
    long_name: 'EDX course library subscription - essentials - Communication Academy',
    description: '',
    marketing_url: '',
    thumbnail_url: '',
    prices: [{
      id: 'price_1TOxCRF2SZotNMi0DIFgPngx',
      product: 'prod_UNidZv2H9p2FID',
      lookup_key: 'essentials_communication_academy_yearly',
      recurring: {
        interval: 'year',
        interval_count: 1,
        usage_type: 'licensed',
      },
      currency: 'usd',
      unit_amount: 14900,
      unit_amount_decimal: '149.00',
    }],
    tags: [],
    stripe_product_id: 'prod_UNidZv2H9p2FID',
    enterprise_catalog_uuid: null,
    edx_catalog_id: null,
  },
  {
    id: 'prod_UNidExro3kofgu',
    name: 'EDX course library subscription - essentials - Leadership Academy',
    long_name: 'EDX course library subscription - essentials - Leadership Academy',
    description: '',
    marketing_url: '',
    thumbnail_url: '',
    prices: [{
      id: 'price_1TOxCRF2SZotNMi0QZjTn2gq',
      product: 'prod_UNidExro3kofgu',
      lookup_key: 'essentials_leadership_academy_yearly',
      recurring: {
        interval: 'year',
        interval_count: 1,
        usage_type: 'licensed',
      },
      currency: 'usd',
      unit_amount: 14900,
      unit_amount_decimal: '149.00',
    }],
    tags: [],
    stripe_product_id: 'prod_UNidExro3kofgu',
    enterprise_catalog_uuid: null,
    edx_catalog_id: null,
  },
  {
    id: 'prod_UNidyKQDHmcUx1',
    name: 'EDX course library subscription - essentials - Tech and Digital Transformation Academy',
    long_name: 'EDX course library subscription - essentials - Tech and Digital Transformation Academy',
    description: '',
    marketing_url: '',
    thumbnail_url: '',
    prices: [{
      id: 'price_1TOxCRF2SZotNMi0HU5M3C5A',
      product: 'prod_UNidyKQDHmcUx1',
      lookup_key: 'essentials_tech_and_digital_transformation_academy_yearly',
      recurring: {
        interval: 'year',
        interval_count: 1,
        usage_type: 'licensed',
      },
      currency: 'usd',
      unit_amount: 14900,
      unit_amount_decimal: '149.00',
    }],
    tags: [],
    stripe_product_id: 'prod_UNidyKQDHmcUx1',
    enterprise_catalog_uuid: null,
    edx_catalog_id: null,
  },
  {
    id: 'prod_UNid2vA4xUIpan',
    name: 'EDX course library subscription - essentials - Data Academy',
    long_name: 'EDX course library subscription - essentials - Data Academy',
    description: '',
    marketing_url: '',
    thumbnail_url: '',
    prices: [{
      id: 'price_1TOxCRF2SZotNMi0LoNZ1CR3',
      product: 'prod_UNid2vA4xUIpan',
      lookup_key: 'essentials_data_academy_yearly',
      recurring: {
        interval: 'year',
        interval_count: 1,
        usage_type: 'licensed',
      },
      currency: 'usd',
      unit_amount: 14900,
      unit_amount_decimal: '149.00',
    }],
    tags: [],
    stripe_product_id: 'prod_UNid2vA4xUIpan',
    enterprise_catalog_uuid: null,
    edx_catalog_id: null,
  },
  {
    id: 'prod_UNidEYhNUIWCFp',
    name: 'EDX course library subscription - essentials - Sustainability Academy',
    long_name: 'EDX course library subscription - essentials - Sustainability Academy',
    description: '',
    marketing_url: '',
    thumbnail_url: '',
    prices: [{
      id: 'price_1TOxCRF2SZotNMi04QAUB0eT',
      product: 'prod_UNidEYhNUIWCFp',
      lookup_key: 'essentials_sustainability_academy_yearly',
      recurring: {
        interval: 'year',
        interval_count: 1,
        usage_type: 'licensed',
      },
      currency: 'usd',
      unit_amount: 14900,
      unit_amount_decimal: '149.00',
    }],
    tags: [],
    stripe_product_id: 'prod_UNidEYhNUIWCFp',
    enterprise_catalog_uuid: null,
    edx_catalog_id: null,
  },
  {
    id: 'prod_UNidsKsdzY8uXk',
    name: 'Test',
    long_name: 'Test',
    description: '',
    marketing_url: '',
    thumbnail_url: '',
    prices: [{
      id: 'price_1TOxCRF2SZotNMi0EDDf17PN',
      product: 'prod_UNidsKsdzY8uXk',
      lookup_key: 'test_yearly',
      recurring: {
        interval: 'year',
        interval_count: 1,
        usage_type: 'licensed',
      },
      currency: 'usd',
      unit_amount: 14900,
      unit_amount_decimal: '149.00',
    }],
    tags: [],
    stripe_product_id: 'prod_UNidsKsdzY8uXk',
    enterprise_catalog_uuid: null,
    edx_catalog_id: null,
  },
];

const academyContentBySlug: Record<string, Partial<Omit<EssentialsAcademyData, 'id' | 'slug' | 'name' | 'price'>>> = {
  'artificial-intelligence': {
    description: 'This pathway helps your team build a strong foundation in AI, and equips them to skillfully incorporate AI into existing organizational strategies.',
    tags: ['AI foundations', 'Intermediate AI', 'Advanced AI', 'AI for business'],
    courseCount: 16,
    marketingUrl: 'https://www.edx.org/learn/artificial-intelligence',
  },
};

const normalizeAcademyText = (value?: string | null) => (value ?? '')
  .toLowerCase()
  .replace(PRODUCT_NAME_PREFIX.toLowerCase(), '')
  .replace(PRODUCT_NAME_SUFFIX.toLowerCase(), '')
  .replace(/academy/g, '')
  .replace(/[^a-z0-9]+/g, ' ')
  .trim();

const toSlug = (value: string) => normalizeAcademyText(value).replace(/\s+/g, '-');

const getDisplayName = (value: string) => value
  .replace(PRODUCT_NAME_PREFIX, '')
  .replace(PRODUCT_NAME_SUFFIX, '')
  .trim();

export const mockEssentialsAcademyProducts: EssentialsAcademyData[] = MOCK_ESSENTIALS_ACADEMY_PRODUCTS_RESPONSE.map((product) => {
  const name = getDisplayName(product.name);
  const slug = toSlug(name);
  const price = product.prices[0];
  const content = academyContentBySlug[slug];

  return {
    id: product.id,
    slug,
    name,
    description: content?.description ?? product.description,
    tags: content?.tags ?? product.tags,
    courseCount: content?.courseCount,
    marketingUrl: content?.marketingUrl ?? product.marketing_url,
    price: price ? {
      id: price.id,
      lookupKey: price.lookup_key,
      unitAmount: price.unit_amount,
      unitAmountDecimal: price.unit_amount_decimal,
      currency: price.currency,
    } : null,
  };
});

export const getDefaultEssentialsAcademy = () => mockEssentialsAcademyProducts[0];

export const findEssentialsAcademy = ({
  academyName,
  lookupKey,
  priceId,
}: {
  academyName?: string | null;
  lookupKey?: string | null;
  priceId?: string | null;
}) => {
  const normalizedAcademyName = normalizeAcademyText(academyName);
  const normalizedLookupKey = normalizeAcademyText(lookupKey);

  return mockEssentialsAcademyProducts.find((academy) => (
    (normalizedAcademyName && normalizeAcademyText(academy.name) === normalizedAcademyName)
    || (lookupKey && academy.price?.lookupKey === lookupKey)
    || (priceId && academy.price?.id === priceId)
    || (normalizedLookupKey && normalizedLookupKey.includes(normalizeAcademyText(academy.name)))
    || (normalizedLookupKey && normalizedLookupKey.includes(academy.slug.replace(/-/g, ' ')))
  )) ?? null;
};