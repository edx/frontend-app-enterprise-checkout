import { IntlProvider } from '@edx/frontend-platform/i18n';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import CustomUrlField from '../CustomUrlField';

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

describe('CustomUrlField', () => {
  const renderComponent = () => render(
    <IntlProvider locale="en">
      <CustomUrlField form={mockForm as any} />
    </IntlProvider>,
  );

  it('renders the title correctly', () => {
    renderComponent();
    validateText('Create a custom URL for your team');
  });

  it('renders the description correctly', () => {
    renderComponent();
    validateText((content) => content.includes('This is how your colleagues will access your team subscription on edX'));
    validateText((content) => content.includes('This access link name cannot be changed after your trial subscription starts'));
  });
});
