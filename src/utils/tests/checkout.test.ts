import { validateFieldDetailed } from '@/components/app/data/services/validation';

import { findAvailableSlug, generateSlugFromCompanyName } from '../checkout';

// Mock the validation service
jest.mock('@/components/app/data/services/validation', () => ({
  validateFieldDetailed: jest.fn(),
}));

const mockValidateFieldDetailed = validateFieldDetailed as jest.Mock;

describe('generateSlugFromCompanyName', () => {
  it('converts company name to lowercase', () => {
    expect(generateSlugFromCompanyName('ACME Corp')).toBe('acme-corp');
  });

  it('replaces spaces with dashes', () => {
    expect(generateSlugFromCompanyName('My Company')).toBe('my-company');
  });

  it('replaces non-alphanumeric characters with dashes', () => {
    expect(generateSlugFromCompanyName('ACME, Inc.')).toBe('acme-inc');
    expect(generateSlugFromCompanyName('Test & Demo Corp.')).toBe('test-demo-corp');
    expect(generateSlugFromCompanyName('Company!!! Name???')).toBe('company-name');
  });

  it('collapses multiple spaces into single dash', () => {
    expect(generateSlugFromCompanyName('My   Company')).toBe('my-company');
    expect(generateSlugFromCompanyName('Test    Demo    Corp')).toBe('test-demo-corp');
  });

  it('collapses multiple consecutive dashes into one', () => {
    expect(generateSlugFromCompanyName('Test---Company')).toBe('test-company');
    expect(generateSlugFromCompanyName('ACME!!!Corp')).toBe('acme-corp');
  });

  it('trims leading and trailing dashes', () => {
    expect(generateSlugFromCompanyName('--ACME Corp--')).toBe('acme-corp');
    expect(generateSlugFromCompanyName('...Company...')).toBe('company');
  });

  it('enforces maximum length of 30 characters', () => {
    const longName = 'This is a Very Long Company Name That Exceeds Thirty Characters';
    const slug = generateSlugFromCompanyName(longName);
    expect(slug.length).toBeLessThanOrEqual(30);
    // Verify it's actually truncated to 30 chars (the result varies based on the actual name)
    expect(slug).toBe('this-is-a-very-long-company-na');
  });

  it('removes trailing dash after truncation', () => {
    // This company name when slugified would be 'acme-international-corporation-...'
    // At 30 chars, it might end with a dash after truncation
    const slug = generateSlugFromCompanyName('ACME International Corporation LLC');
    expect(slug).not.toMatch(/-$/); // Should not end with dash
    expect(slug.length).toBeLessThanOrEqual(30);
  });

  it('handles empty or invalid input', () => {
    expect(generateSlugFromCompanyName('')).toBe('');
    expect(generateSlugFromCompanyName(null as any)).toBe('');
    expect(generateSlugFromCompanyName(undefined as any)).toBe('');
  });

  it('handles special characters correctly', () => {
    expect(generateSlugFromCompanyName('Café & Restaurant')).toBe('caf-restaurant');
    expect(generateSlugFromCompanyName('Company™ Ltd.')).toBe('company-ltd');
  });

  it('handles numbers in company name', () => {
    expect(generateSlugFromCompanyName('Company 123')).toBe('company-123');
    expect(generateSlugFromCompanyName('24/7 Support')).toBe('24-7-support');
  });

  it('handles only special characters', () => {
    expect(generateSlugFromCompanyName('!!!')).toBe('');
    expect(generateSlugFromCompanyName('...')).toBe('');
  });

  it('handles mixed case with numbers and special characters', () => {
    expect(generateSlugFromCompanyName('ABC-123 Corp.')).toBe('abc-123-corp');
  });

  describe('custom max length', () => {
    it('respects custom max length parameter', () => {
      const slug = generateSlugFromCompanyName('Very Long Company Name', 10);
      expect(slug.length).toBeLessThanOrEqual(10);
      expect(slug).toBe('very-long');
    });

    it('removes trailing dash after custom length truncation', () => {
      const slug = generateSlugFromCompanyName('Test Company Name', 12);
      expect(slug).not.toMatch(/-$/);
      expect(slug.length).toBeLessThanOrEqual(12);
    });
  });
});

describe('findAvailableSlug', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns the base slug if it is available', async () => {
    mockValidateFieldDetailed.mockResolvedValue({
      isValid: true,
      validationDecisions: { enterpriseSlug: null },
    });

    const result = await findAvailableSlug('acme-inc', 'admin@acme.com');
    expect(result).toBe('acme-inc');
    expect(mockValidateFieldDetailed).toHaveBeenCalledWith(
      'enterpriseSlug',
      'acme-inc',
      { adminEmail: 'admin@acme.com' },
      true,
    );
  });

  it('appends -1 if base slug is taken', async () => {
    mockValidateFieldDetailed
      .mockResolvedValueOnce({
        isValid: false,
        validationDecisions: { enterpriseSlug: { errorCode: 'taken' } },
      })
      .mockResolvedValueOnce({
        isValid: true,
        validationDecisions: { enterpriseSlug: null },
      });

    const result = await findAvailableSlug('acme-inc', 'admin@acme.com');
    expect(result).toBe('acme-inc-1');
    expect(mockValidateFieldDetailed).toHaveBeenCalledTimes(2);
  });

  it('increments suffix until available slug is found', async () => {
    mockValidateFieldDetailed
      .mockResolvedValueOnce({
        isValid: false,
        validationDecisions: { enterpriseSlug: { errorCode: 'taken' } },
      })
      .mockResolvedValueOnce({
        isValid: false,
        validationDecisions: { enterpriseSlug: { errorCode: 'taken' } },
      })
      .mockResolvedValueOnce({
        isValid: false,
        validationDecisions: { enterpriseSlug: { errorCode: 'taken' } },
      })
      .mockResolvedValueOnce({
        isValid: true,
        validationDecisions: { enterpriseSlug: null },
      });

    const result = await findAvailableSlug('acme-inc', 'admin@acme.com');
    expect(result).toBe('acme-inc-3');
    expect(mockValidateFieldDetailed).toHaveBeenCalledTimes(4);
  });

  it('truncates base slug if adding suffix exceeds max length', async () => {
    // Create a base slug that is 28 characters (max is 30)
    const longSlug = 'a'.repeat(28); // 28 chars

    mockValidateFieldDetailed
      .mockResolvedValueOnce({
        isValid: false,
        validationDecisions: { enterpriseSlug: { errorCode: 'taken' } },
      })
      .mockResolvedValueOnce({
        isValid: true,
        validationDecisions: { enterpriseSlug: null },
      });

    const result = await findAvailableSlug(longSlug, 'admin@test.com', 30);

    // With suffix -1, total should be <= 30 chars
    expect(result.length).toBeLessThanOrEqual(30);
    expect(result).toMatch(/-1$/);
  });

  it('works without admin email', async () => {
    mockValidateFieldDetailed.mockResolvedValue({
      isValid: true,
      validationDecisions: { enterpriseSlug: null },
    });

    const result = await findAvailableSlug('test-slug');
    expect(result).toBe('test-slug');
    expect(mockValidateFieldDetailed).toHaveBeenCalledWith(
      'enterpriseSlug',
      'test-slug',
      undefined,
      true,
    );
  });

  it('returns empty string for empty base slug', async () => {
    const result = await findAvailableSlug('');
    expect(result).toBe('');
    expect(mockValidateFieldDetailed).not.toHaveBeenCalled();
  });

  it('handles validation errors gracefully', async () => {
    mockValidateFieldDetailed.mockRejectedValue(new Error('Network error'));

    const result = await findAvailableSlug('test-slug', 'admin@test.com');
    expect(result).toBe('test-slug');
  });

  it('respects custom max length', async () => {
    const slug = 'a'.repeat(18); // 18 chars

    mockValidateFieldDetailed
      .mockResolvedValueOnce({
        isValid: false,
        validationDecisions: { enterpriseSlug: { errorCode: 'taken' } },
      })
      .mockResolvedValueOnce({
        isValid: true,
        validationDecisions: { enterpriseSlug: null },
      });

    const result = await findAvailableSlug(slug, 'admin@test.com', 20);
    expect(result.length).toBeLessThanOrEqual(20);
    expect(result).toMatch(/-1$/);
  });

  it('removes trailing dash after truncation', async () => {
    // Create a slug that ends with dash when truncated
    const slug = 'test-company-name-long-slug';

    mockValidateFieldDetailed
      .mockResolvedValueOnce({
        isValid: false,
        validationDecisions: { enterpriseSlug: { errorCode: 'taken' } },
      })
      .mockResolvedValueOnce({
        isValid: true,
        validationDecisions: { enterpriseSlug: null },
      });

    const result = await findAvailableSlug(slug, 'admin@test.com', 25);
    expect(result.length).toBeLessThanOrEqual(25);
    expect(result).not.toMatch(/--/); // No double dashes
    expect(result).toMatch(/-1$/); // Should end with -1
  });

  it('stops after max attempts to prevent infinite loop', async () => {
    // Always return invalid
    mockValidateFieldDetailed.mockResolvedValue({
      isValid: false,
      validationDecisions: { enterpriseSlug: { errorCode: 'taken' } },
    });

    const result = await findAvailableSlug('test-slug', 'admin@test.com');

    // Should stop after max attempts (100) and return the last candidate
    expect(mockValidateFieldDetailed).toHaveBeenCalledTimes(100);
    expect(result).toMatch(/test-slug-\d+$/);
  });
});
