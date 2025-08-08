import { IntlProvider } from '@edx/frontend-platform/i18n';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import CompanyNameField from '../CompanyNameField';

// Mock the form object
const createMockForm = (errors = {}) => ({
  formState: {
    errors,
    touchedFields: { companyName: true },
  },
  register: jest.fn().mockReturnValue({}),
});

jest.mock('@/components/FormFields/Field', () => ({
  __esModule: true,
  default: ({ floatingLabel, placeholder, form, name }) => {
    const error = form?.formState?.errors[name];
    return (
      <div data-testid="field-mock">
        <div data-testid="floating-label">{floatingLabel}</div>
        <div data-testid="placeholder">{placeholder}</div>
        {error && <div data-testid="error-message">{error.message}</div>}
      </div>
    );
  },
}));

describe('CompanyNameField', () => {
  const renderComponent = (errors = {}) => render(
    <IntlProvider locale="en">
      <CompanyNameField form={createMockForm(errors) as any} />
    </IntlProvider>,
  );

  it('renders the title correctly', () => {
    renderComponent();
    validateText('What is the name of your company or organization?');
  });

  it('renders the field with correct labels', () => {
    renderComponent();
    expect(screen.getByTestId('floating-label')).toHaveTextContent('Company Name');
    expect(screen.getByTestId('placeholder')).toHaveTextContent('Enter your company name');
  });

  it('displays validation error when companyName is invalid', () => {
    renderComponent({
      companyName: {
        type: 'required',
        message: 'Company name is required',
      },
    });
    expect(screen.getByTestId('error-message')).toHaveTextContent('Company name is required');
  });
});
