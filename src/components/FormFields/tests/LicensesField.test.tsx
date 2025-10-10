import { IntlProvider } from '@edx/frontend-platform/i18n';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import LicensesField from '../LicensesField';

// Mock the form object
const mockForm = {
  formState: {
    errors: {},
    touchedFields: {},
  },
  register: jest.fn().mockReturnValue({}),
};

jest.mock('@/components/FormFields/Field', () => ({
  __esModule: true,
  default: ({ floatingLabel, placeholder }) => (
    <div data-testid="field-mock">
      <div data-testid="floating-label">{floatingLabel}</div>
      <div data-testid="placeholder">{placeholder}</div>
    </div>
  ),
}));

describe('LicensesField', () => {
  const renderComponent = () => render(
    <IntlProvider locale="en">
      <LicensesField form={mockForm as any} />
    </IntlProvider>,
  );

  it('renders the title correctly', () => {
    renderComponent();
    validateText('Number of licenses', { selector: 'h3' });
  });

  it('renders the description correctly', () => {
    renderComponent();
    validateText('Enter in the number of licenses you want to purchase. As an administrator, you can issue and swap licenses between employees.');
  });

  it('renders the field with correct labels', () => {
    renderComponent();
    expect(screen.getByTestId('floating-label')).toHaveTextContent('Number of licenses');
    expect(screen.getByTestId('placeholder')).toHaveTextContent('eg. 10');
  });
});
