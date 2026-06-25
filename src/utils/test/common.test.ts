import dayjs from 'dayjs';

import { CheckoutErrorMessagesByField } from '@/constants/checkout';
import {
  defaultQueryClientRetryHandler,
  isExpired,
  serverValidationError,
} from '@/utils/common';
import {
  resolveEssentialsProduct,
} from '@/utils/resolveEssentialsProduct';

describe('defaultQueryClientRetryHandler', () => {
  it.each([
    {
      retryCount: 0,
      error: { customAttributes: { httpErrorStatus: 500 } },
      expectedShouldRetry: true,
    },
    {
      retryCount: 3,
      error: { customAttributes: { httpErrorStatus: 500 } },
      expectedShouldRetry: false,
    },
    // Axios 404
    {
      retryCount: 0,
      error: { customAttributes: { httpErrorStatus: 404 } },
      expectedShouldRetry: false,
    },
    // Regular 404
    {
      retryCount: 0,
      error: { response: { status: 404 } },
      expectedShouldRetry: false,
    },
  ])('returns expected output for each test case', ({
    retryCount,
    error,
    expectedShouldRetry,
  }) => {
    const shouldRetry = defaultQueryClientRetryHandler(retryCount, error);
    expect(shouldRetry).toBe(expectedShouldRetry);
  });
});

describe('serverValidationError', () => {
  const mapping = CheckoutErrorMessagesByField;

  const cases = Object.entries(mapping)
    .flatMap(([field, codes]) => Object.entries(codes)
      .map(([errorCode, expectedMessage]) => ({ field, errorCode, expectedMessage })));

  it.each(cases)(
    'returns mapped message when matching errorCode exists for $field: $errorCode',
    ({ field, errorCode, expectedMessage }: any) => {
      const decisions: any = {
        [field]: { errorCode, developerMessage: 'irrelevant' },
      };

      const msg = serverValidationError(field, decisions, mapping as any);
      expect(msg).toBe(expectedMessage);
    },
  );

  it('returns default message when validationDecisions is null', () => {
    const msg = serverValidationError('quantity', null as any, mapping as any);
    expect(msg).toBe('Failed server-side validation');
  });

  it('returns default message when no decision exists for field', () => {
    const decisions: any = {
      adminEmail: { errorCode: 'invalid_format', developerMessage: 'Invalid' },
    };

    const msg = serverValidationError('quantity', decisions, mapping as any);
    expect(msg).toBe('Failed server-side validation');
  });

  it('returns default message when errorCode is not in mapping', () => {
    const decisions: any = {
      quantity: { errorCode: 'unknown_code', developerMessage: 'Unknown' },
    };

    const msg = serverValidationError('quantity', decisions, mapping as any);
    expect(msg).toBe('Failed server-side validation');
  });
});

describe('isExpired', () => {
  const fixedNow = new Date('2025-08-20T20:00:00.000Z');

  beforeEach(() => {
    jest.useFakeTimers({ legacyFakeTimers: false });
    jest.setSystemTime(fixedNow);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns true for a past date', () => {
    const past = dayjs(fixedNow).subtract(1, 'minute').toISOString();
    expect(isExpired(past)).toBe(true);
  });

  it('returns false for a future date', () => {
    const future = dayjs(fixedNow).add(1, 'minute').toISOString();
    expect(isExpired(future)).toBe(false);
  });

  it('returns false for a date equal to now (boundary condition)', () => {
    const equalToNow = dayjs(fixedNow).toISOString();
    expect(isExpired(equalToNow)).toBe(false);
  });
});

describe('resolveEssentialsProduct', () => {
  const mockProducts = [
    {
      name: 'AI',
      longName: 'AI Academy',
      slug: 'ai-academy-yearly',
      lookupKey: 'essentials_artificial_intelligence_subscription_license_yearly',
      price: '149.00',
      courseCount: 8,
    },
    {
      name: 'Data',
      longName: 'Data Academy',
      slug: 'data-academy-yearly',
      lookupKey: 'essentials_data_subscription_license_yearly',
      price: '199.00',
      courseCount: 10,
    },
    {
      name: 'Leadership',
      longName: 'Leadership Academy',
      slug: 'leadership-academy-yearly',
      lookupKey: 'leadership_subscription_license_yearly',
      price: '179.00',
      courseCount: 6,
    },
  ] as any[];
  describe('exact match', () => {
    it('matches by lookupKey', () => {
      const result = resolveEssentialsProduct(
        mockProducts,
        'essentials_data_subscription_license_yearly',
      );
      expect(result?.name).toBe('Data');
    });
    it('matches by slug', () => {
      const result = resolveEssentialsProduct(mockProducts, 'ai-academy-yearly');
      expect(result?.name).toBe('AI');
    });
  });

  describe('empty products', () => {
    it('returns undefined when products array is empty', () => {
      const result = resolveEssentialsProduct([], 'any-key');
      expect(result).toBeUndefined();
    });
  });
  describe('edge cases', () => {
    it('handles products with missing lookupKey', () => {
      const products = [
        { name: 'NoKey', slug: 'no-key-yearly', lookupKey: undefined, price: '99.00' },
      ] as any[];
      const result = resolveEssentialsProduct(products, 'no-key-yearly');
      expect(result?.name).toBe('NoKey');
    });
    it('handles products with missing slug', () => {
      const products = [
        { name: 'NoSlug', slug: undefined, lookupKey: 'essentials_noslug_yearly', price: '99.00' },
      ] as any[];
      const result = resolveEssentialsProduct(products, 'essentials_noslug_yearly');
      expect(result?.name).toBe('NoSlug');
    });
    it('handles products with both lookupKey and slug missing', () => {
      const products = [
        { name: 'Empty', slug: undefined, lookupKey: undefined, price: '99.00' },
      ] as any[];

      const result = resolveEssentialsProduct(products, 'any-key');
      expect(result).toBeUndefined();
    });
  });
});
