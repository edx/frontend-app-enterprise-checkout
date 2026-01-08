import { getConfig } from '@edx/frontend-platform/config';
import dayjs from 'dayjs';

import { CheckoutErrorMessagesByField } from '@/constants/checkout';
import {
  defaultQueryClientRetryHandler,
  isExpired,
  isFeatureEnabled,
  serverValidationError,
} from '@/utils/common';

jest.mock('@edx/frontend-platform/config', () => ({
  getConfig: jest.fn(() => ({
    PUBLIC_PATH: '/',
  })),
}));

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

describe('isFeatureEnabled', () => {
  const SSP_SESSION_KEY = 'edx.checkout.self-service-purchasing';

  beforeEach(() => {
    sessionStorage.clear();
    jest.clearAllMocks();
  });

  it('returns true when enabled is true', () => {
    (getConfig as jest.Mock).mockReturnValue({});
    expect(isFeatureEnabled(true)).toBe(true);
  });

  it('returns false when enabled is false and no keys are in session', () => {
    (getConfig as jest.Mock).mockReturnValue({
      FEATURE_SELF_SERVICE_SITE_KEY: 'site-key',
    });
    expect(isFeatureEnabled(false, 'feature-key')).toBe(false);
  });

  it('returns true when enabled is false but featureKey matches session storage', () => {
    (getConfig as jest.Mock).mockReturnValue({});
    sessionStorage.setItem(SSP_SESSION_KEY, 'feature-key');
    expect(isFeatureEnabled(false, 'feature-key')).toBe(true);
  });

  it('returns true when enabled is false but siteKey matches session storage', () => {
    (getConfig as jest.Mock).mockReturnValue({
      FEATURE_SELF_SERVICE_SITE_KEY: 'site-key',
    });
    sessionStorage.setItem(SSP_SESSION_KEY, 'site-key');
    expect(isFeatureEnabled(false, 'feature-key')).toBe(true);
  });

  it('returns false when session storage key does not match either featureKey or siteKey', () => {
    (getConfig as jest.Mock).mockReturnValue({
      FEATURE_SELF_SERVICE_SITE_KEY: 'site-key',
    });
    sessionStorage.setItem(SSP_SESSION_KEY, 'wrong-key');
    expect(isFeatureEnabled(false, 'feature-key')).toBe(false);
  });

  it('returns true if enabled is false but siteKey is matched, even if featureKey is null', () => {
    (getConfig as jest.Mock).mockReturnValue({
      FEATURE_SELF_SERVICE_SITE_KEY: 'site-key',
    });
    sessionStorage.setItem(SSP_SESSION_KEY, 'site-key');
    expect(isFeatureEnabled(false, null)).toBe(true);
  });
});
