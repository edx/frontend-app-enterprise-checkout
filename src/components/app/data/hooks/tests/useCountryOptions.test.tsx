import { IntlProvider } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import useCountryOptions from '@/components/app/data/hooks/useCountryOptions';
import useFormValidationConstraints from '@/components/app/data/hooks/useFormValidationConstraints';

// Mock the form validation constraints hook
jest.mock('@/components/app/data/hooks/useFormValidationConstraints');

const mockedUseFormValidationConstraints = useFormValidationConstraints as unknown as jest.Mock;

// Test helper component to consume the hook in a React render
const HookConsumer: React.FC = () => {
  const countryOptions = useCountryOptions();

  return (
    <div>
      <div data-testid="country-count">{countryOptions.length}</div>
      <div data-testid="country-options">{JSON.stringify(countryOptions)}</div>
    </div>
  );
};

const renderWithAppContext = (
  ui: React.ReactElement,
  appCtxValue: any = {
    config: {},
    authenticatedUser: { userId: 12345 },
  },
  locale: string = 'en',
) => render(
  <AppContext.Provider value={appCtxValue}>
    <IntlProvider locale={locale} messages={{}}>
      {ui}
    </IntlProvider>
  </AppContext.Provider>,
);

describe('useCountryOptions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns all countries when embargo list is empty', () => {
    mockedUseFormValidationConstraints.mockReturnValue({
      data: { embargoedCountries: [] },
    });

    renderWithAppContext(<HookConsumer />);

    const countElement = screen.getByTestId('country-count');
    // getCountryMessages returns ~250 countries
    expect(parseInt(countElement.textContent || '0', 10)).toBeGreaterThan(200);
  });

  it('filters out embargoed countries correctly', () => {
    mockedUseFormValidationConstraints.mockReturnValue({
      data: { embargoedCountries: ['RU', 'IR', 'KP'] },
    });

    renderWithAppContext(<HookConsumer />);

    const optionsElement = screen.getByTestId('country-options');
    const options = JSON.parse(optionsElement.textContent || '[]');

    // Verify embargoed countries are NOT in the list
    const countryCodes = options.map((opt: any) => opt.value);
    expect(countryCodes).not.toContain('RU');
    expect(countryCodes).not.toContain('IR');
    expect(countryCodes).not.toContain('KP');

    // Verify non-embargoed countries ARE in the list
    expect(countryCodes).toContain('US');
    expect(countryCodes).toContain('CA');
  });

  it('returns localized country names based on locale', () => {
    mockedUseFormValidationConstraints.mockReturnValue({
      data: { embargoedCountries: [] },
    });

    renderWithAppContext(<HookConsumer />, undefined, 'en');

    const optionsElement = screen.getByTestId('country-options');
    const options = JSON.parse(optionsElement.textContent || '[]');

    // Find US country option
    const usOption = options.find((opt: any) => opt.value === 'US');
    expect(usOption).toBeDefined();
    expect(usOption.label).toBe('United States of America');
  });

  it('uses 2-character country codes as values', () => {
    mockedUseFormValidationConstraints.mockReturnValue({
      data: { embargoedCountries: [] },
    });

    renderWithAppContext(<HookConsumer />);

    const optionsElement = screen.getByTestId('country-options');
    const options = JSON.parse(optionsElement.textContent || '[]');

    // Check that all values are 2-character codes
    options.forEach((opt: any) => {
      expect(opt.value).toHaveLength(2);
      expect(opt.value).toMatch(/^[A-Z]{2}$/);
    });
  });

  it('handles missing fieldConstraints gracefully', () => {
    mockedUseFormValidationConstraints.mockReturnValue({
      data: null,
    });

    renderWithAppContext(<HookConsumer />);

    const countElement = screen.getByTestId('country-count');
    // Should still return all countries (defaults to empty embargo list)
    expect(parseInt(countElement.textContent || '0', 10)).toBeGreaterThan(200);
  });

  it('handles missing embargoedCountries field gracefully', () => {
    mockedUseFormValidationConstraints.mockReturnValue({
      data: { quantity: { min: 1, max: 100 } }, // No embargoedCountries field
    });

    renderWithAppContext(<HookConsumer />);

    const countElement = screen.getByTestId('country-count');
    // Should still return all countries (defaults to empty embargo list)
    expect(parseInt(countElement.textContent || '0', 10)).toBeGreaterThan(200);
  });

  it('returns countries sorted alphabetically by localized name', () => {
    mockedUseFormValidationConstraints.mockReturnValue({
      data: { embargoedCountries: [] },
    });

    renderWithAppContext(<HookConsumer />);

    const optionsElement = screen.getByTestId('country-options');
    const options = JSON.parse(optionsElement.textContent || '[]');

    // Check that countries are sorted alphabetically by label
    for (let i = 1; i < options.length; i++) {
      const prevLabel = options[i - 1].label.toLowerCase();
      const currLabel = options[i].label.toLowerCase();
      expect(prevLabel.localeCompare(currLabel)).toBeLessThanOrEqual(0);
    }
  });
});
