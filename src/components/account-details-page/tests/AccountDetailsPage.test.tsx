import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { CheckoutPageDetails, CheckoutStepKey } from '@/components/Stepper/constants';
import { renderWithRouterAndStepperProvider } from '@/utils/tests';

import AccountDetailsPage from '../AccountDetailsPage';

// Mock the hooks and components
jest.mock('@/hooks/useCheckoutFormStore', () => ({
  __esModule: true,
  default: jest.fn((cb) => {
    const defaultState = {
      formData: { AccountDetails: {} },
      setFormData: jest.fn(),
    };
    return cb(defaultState);
  }),
}));

// Keep mocks for complex components for now
jest.mock('@/components/FormFields/OrganizationNameField', () => ({
  __esModule: true,
  default: () => <div data-testid="organization-name-field-mock" />,
}));

jest.mock('@/components/FormFields/CustomUrlField', () => ({
  __esModule: true,
  default: () => <div data-testid="custom-url-field-mock" />,
}));

describe('AccountDetailsPage', () => {
  const renderComponent = () => renderWithRouterAndStepperProvider(
    <AccountDetailsPage />,
    CheckoutStepKey.AccountDetails,
    {
      initialEntries: [CheckoutPageDetails.AccountDetails.route],
    },
  );

  it('renders the title correctly', () => {
    renderComponent();
    expect(screen.getByText('Account Details')).toBeInTheDocument();
  });

  it('renders the continue button correctly', () => {
    renderComponent();
    expect(screen.getByText('Continue')).toBeInTheDocument();
  });

  it('renders the OrganizationNameField component', () => {
    renderComponent();
    expect(screen.getByTestId('organization-name-field-mock')).toBeInTheDocument();
  });

  it('renders the CustomUrlField component', () => {
    renderComponent();
    expect(screen.getByTestId('custom-url-field-mock')).toBeInTheDocument();
  });
});
