import { createIntl } from '@edx/frontend-platform/i18n';

import { validateFieldDetailed } from '@/components/app/data/services/validation';

import { AccountDetailsSchema } from '../checkout';

jest.mock('@/components/app/data/services/validation', () => ({
  validateFieldDetailed: jest.fn(),
}));

jest.mock('@/utils/common', () => ({
  serverValidationError: jest.fn(),
}));

describe('AccountDetailsSchema', () => {
  const constraints = {
    companyName: { minLength: 1, maxLength: 255 },
    enterpriseSlug: { minLength: 1, maxLength: 255, pattern: '^[a-z0-9-]+$' },
  };
  const intl = createIntl({ locale: 'en', messages: {} });

  beforeEach(() => {
    jest.clearAllMocks();
    (validateFieldDetailed as jest.Mock).mockResolvedValue({ isValid: true });
  });

  it('validates that companyName and enterpriseSlug are required when they are undefined', async () => {
    const schema = AccountDetailsSchema(constraints, { intl });
    const result = await schema.safeParseAsync({
      companyName: undefined,
      enterpriseSlug: undefined,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const { fieldErrors } = result.error.flatten();
      expect(fieldErrors.companyName).toContain('Company name is required');
      expect(fieldErrors.enterpriseSlug).toContain('Company URL is required');
    }
  });

  it('validates that companyName and enterpriseSlug are required when they are null', async () => {
    const schema = AccountDetailsSchema(constraints, { intl });
    const result = await schema.safeParseAsync({
      companyName: null,
      enterpriseSlug: null,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const { fieldErrors } = result.error.flatten();
      expect(fieldErrors.companyName).toContain('Company name is required');
      expect(fieldErrors.enterpriseSlug).toContain('Company URL is required');
    }
  });

  it('validates that companyName and enterpriseSlug pass validation when they are valid', async () => {
    const schema = AccountDetailsSchema(constraints, { intl });
    const result = await schema.safeParseAsync({
      companyName: 'Acme Corp',
      enterpriseSlug: 'acme-corp',
    });

    expect(result.success).toBe(true);
  });
});
