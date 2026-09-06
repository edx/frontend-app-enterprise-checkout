import { getConfig } from '@edx/frontend-platform/config';

import { getQuantityMaxValidationMessage } from '../checkout';

jest.mock('@edx/frontend-platform/config', () => ({
  getConfig: jest.fn(() => ({})),
}));

describe('getQuantityMaxValidationMessage', () => {
  afterEach(() => {
    sessionStorage.removeItem('isEssentials');
  });

  it('builds Teams copy and resolves TEAMS_PRODUCT_URL when not in the Essentials flow', () => {
    sessionStorage.removeItem('isEssentials');
    (getConfig as jest.Mock).mockReturnValue({
      TEAMS_PRODUCT_URL: 'https://example.com/teams',
      ESSENTIALS_PRODUCT_URL: 'https://example.com/essentials',
    });

    const result = getQuantityMaxValidationMessage(30);

    expect(result.beforeLink).toContain('Teams plan');
    expect(result.beforeLink).toContain('up to 30 licenses');
    expect(result.linkText).toBe('contact us');
    expect(result.contactUrl).toBe('https://example.com/teams');
    expect(result.plainText).toBe(
      'You can only have up to 30 licenses on the Teams plan. Either decrease the number of licenses or contact us.',
    );
  });

  it('builds Essentials copy and resolves ESSENTIALS_PRODUCT_URL when in the Essentials flow', () => {
    sessionStorage.setItem('isEssentials', 'true');
    (getConfig as jest.Mock).mockReturnValue({
      TEAMS_PRODUCT_URL: 'https://example.com/teams',
      ESSENTIALS_PRODUCT_URL: 'https://example.com/essentials',
    });

    const result = getQuantityMaxValidationMessage(30);

    expect(result.beforeLink).toContain('Essentials plan');
    expect(result.contactUrl).toBe('https://example.com/essentials');
    expect(result.plainText).toBe(
      'You can only have up to 30 licenses on the Essentials plan. Either decrease the number of licenses or contact us.',
    );
  });

  it('resolves contactUrl to null when the configured value is missing or empty', () => {
    sessionStorage.removeItem('isEssentials');
    (getConfig as jest.Mock).mockReturnValue({
      TEAMS_PRODUCT_URL: null,
      ESSENTIALS_PRODUCT_URL: '',
    });

    expect(getQuantityMaxValidationMessage(30).contactUrl).toBeNull();

    sessionStorage.setItem('isEssentials', 'true');
    expect(getQuantityMaxValidationMessage(30).contactUrl).toBeNull();
  });

  it('composes plainText from beforeLink, linkText, and afterLink exactly', () => {
    (getConfig as jest.Mock).mockReturnValue({});
    const result = getQuantityMaxValidationMessage(50);

    expect(result.plainText).toBe(`${result.beforeLink}${result.linkText}${result.afterLink}`);
  });
});
