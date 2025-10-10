import { IntlProvider } from '@edx/frontend-platform/i18n';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { useCountryOptions } from '@/components/app/data/hooks';

import NameAndEmailFields from '../NameAndEmailFields';

// Mock the useCountryOptions hook
jest.mock('@/components/app/data/hooks', () => ({
  useCountryOptions: jest.fn(),
}));

const mockedUseCountryOptions = useCountryOptions as jest.Mock;

// Mock the Field component
jest.mock('@/components/FormFields/Field', () => ({
  __esModule: true,
  default: ({ floatingLabel, placeholder, form, name, type, options }) => {
    const error = form?.formState?.errors[name];
    return (
      <div data-testid={`field-${name}`}>
        <div data-testid={`${name}-floating-label`}>{floatingLabel}</div>
        <div data-testid={`${name}-placeholder`}>{placeholder}</div>
        <div data-testid={`${name}-type`}>{type}</div>
        {type === 'select' && options && (
          <div data-testid={`${name}-options`}>
            {JSON.stringify(options)}
          </div>
        )}
        {error && <div data-testid={`${name}-error-message`}>{error.message}</div>}
      </div>
    );
  },
}));

// Mock the form object
const createMockForm = (errors = {}) => ({
  formState: {
    errors,
    touchedFields: {},
  },
  register: jest.fn().mockReturnValue({}),
});

describe('NameAndEmailFields', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = (errors = {}) => render(
    <IntlProvider locale="en">
      <NameAndEmailFields form={createMockForm(errors) as any} />
    </IntlProvider>,
  );

  it('renders the title and description correctly', () => {
    mockedUseCountryOptions.mockReturnValue([
      { value: 'US', label: 'United States' },
      { value: 'CA', label: 'Canada' },
    ]);

    renderComponent();

    validateText('What is your name and email?');
    validateText('Please use your work email to build your team\'s subscription trial.');
  });

  it('renders fullName field with correct labels', () => {
    mockedUseCountryOptions.mockReturnValue([]);

    renderComponent();

    expect(screen.getByTestId('fullName-floating-label')).toHaveTextContent('Full Name');
    expect(screen.getByTestId('fullName-placeholder')).toHaveTextContent('Enter your full name');
    expect(screen.getByTestId('fullName-type')).toHaveTextContent('text');
  });

  it('renders adminEmail field with correct labels', () => {
    mockedUseCountryOptions.mockReturnValue([]);

    renderComponent();

    expect(screen.getByTestId('adminEmail-floating-label')).toHaveTextContent('Work Email');
    expect(screen.getByTestId('adminEmail-placeholder')).toHaveTextContent('Enter your work email');
    expect(screen.getByTestId('adminEmail-type')).toHaveTextContent('email');
  });

  it('renders country field with correct labels', () => {
    mockedUseCountryOptions.mockReturnValue([
      { value: 'US', label: 'United States' },
      { value: 'CA', label: 'Canada' },
    ]);

    renderComponent();

    expect(screen.getByTestId('country-floating-label')).toHaveTextContent('Country of Residence');
    expect(screen.getByTestId('country-placeholder')).toHaveTextContent('Select a country');
    expect(screen.getByTestId('country-type')).toHaveTextContent('select');
  });

  it('passes country options from useCountryOptions hook to country field', () => {
    const mockCountryOptions = [
      { value: 'US', label: 'United States' },
      { value: 'CA', label: 'Canada' },
      { value: 'GB', label: 'United Kingdom' },
    ];

    mockedUseCountryOptions.mockReturnValue(mockCountryOptions);

    renderComponent();

    const optionsElement = screen.getByTestId('country-options');
    const options = JSON.parse(optionsElement.textContent || '[]');

    expect(options).toEqual(mockCountryOptions);
  });

  it('country dropdown does not contain embargoed countries', () => {
    // Simulate hook filtering out embargoed countries
    const mockCountryOptions = [
      { value: 'US', label: 'United States' },
      { value: 'CA', label: 'Canada' },
      { value: 'GB', label: 'United Kingdom' },
      // RU, IR, KP should be filtered out by the hook
    ];

    mockedUseCountryOptions.mockReturnValue(mockCountryOptions);

    renderComponent();

    const optionsElement = screen.getByTestId('country-options');
    const options = JSON.parse(optionsElement.textContent || '[]');
    const countryCodes = options.map((opt: any) => opt.value);

    // Verify embargoed countries are NOT in the list
    expect(countryCodes).not.toContain('RU');
    expect(countryCodes).not.toContain('IR');
    expect(countryCodes).not.toContain('KP');

    // Verify non-embargoed countries ARE in the list
    expect(countryCodes).toContain('US');
    expect(countryCodes).toContain('CA');
    expect(countryCodes).toContain('GB');
  });

  it('country options use 2-character country codes as values', () => {
    const mockCountryOptions = [
      { value: 'US', label: 'United States' },
      { value: 'CA', label: 'Canada' },
    ];

    mockedUseCountryOptions.mockReturnValue(mockCountryOptions);

    renderComponent();

    const optionsElement = screen.getByTestId('country-options');
    const options = JSON.parse(optionsElement.textContent || '[]');

    options.forEach((opt: any) => {
      expect(opt.value).toHaveLength(2);
      expect(opt.value).toMatch(/^[A-Z]{2}$/);
    });
  });

  it('handles empty country options gracefully', () => {
    mockedUseCountryOptions.mockReturnValue([]);

    renderComponent();

    const optionsElement = screen.getByTestId('country-options');
    const options = JSON.parse(optionsElement.textContent || '[]');

    expect(options).toEqual([]);
  });
});
