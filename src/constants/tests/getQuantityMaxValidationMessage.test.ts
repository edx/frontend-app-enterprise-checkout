import { getQuantityMaxValidationMessage } from '../checkout';

describe('getQuantityMaxValidationMessage', () => {
  it('builds Teams copy pointing at the Teams config key', () => {
    const result = getQuantityMaxValidationMessage(30, 'teams');

    expect(result.configKey).toBe('TEAMS_PRODUCT_URL');
    expect(result.beforeLink).toContain('Teams plan');
    expect(result.beforeLink).toContain('up to 30 licenses');
    expect(result.linkText).toBe('contact us');
    expect(result.plainText).toBe(
      'You can only have up to 30 licenses on the Teams plan. Either decrease the number of licenses or contact us.',
    );
  });

  it('builds Essentials copy pointing at the Essentials config key', () => {
    const result = getQuantityMaxValidationMessage(30, 'essentials');

    expect(result.configKey).toBe('ESSENTIALS_PRODUCT_URL');
    expect(result.beforeLink).toContain('Essentials plan');
    expect(result.plainText).toBe(
      'You can only have up to 30 licenses on the Essentials plan. Either decrease the number of licenses or contact us.',
    );
  });

  it('composes plainText from beforeLink, linkText, and afterLink exactly', () => {
    const result = getQuantityMaxValidationMessage(50, 'teams');

    expect(result.plainText).toBe(`${result.beforeLink}${result.linkText}${result.afterLink}`);
  });
});
