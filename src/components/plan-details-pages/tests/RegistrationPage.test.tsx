import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { CheckoutStepKey } from '@/components/Stepper/constants';
import { renderWithRouterAndStepperProvider } from '@/utils/tests';

import RegistrationPage from '../RegistrationPage';

// Mock the hooks and components
jest.mock('@/hooks/useCheckoutFormStore', () => ({
  __esModule: true,
  default: () => ({
    formData: {
      planDetailsRegistration: {},
    },
    setFormData: jest.fn(),
  }),
}));

// Keep mocks for complex components for now
jest.mock('@/components/FormFields/RegisterAccountFields', () => ({
  __esModule: true,
  default: () => <div data-testid="register-account-fields-mock" />,
}));

jest.mock('@/components/PriceAlert/PriceAlert', () => ({
  __esModule: true,
  default: () => <div data-testid="price-alert-mock" />,
}));

describe('RegistrationPage', () => {
  const renderComponent = () => renderWithRouterAndStepperProvider(
    <RegistrationPage />,
    CheckoutStepKey.PlanDetails,
  );

  it('renders the title correctly', () => {
    renderComponent();
    expect(screen.getByText('Create your Account')).toBeInTheDocument();
  });

  it('renders the register button correctly', () => {
    renderComponent();
    expect(screen.getByText('Register')).toBeInTheDocument();
  });

  it('renders the PriceAlert component', () => {
    renderComponent();
    expect(screen.getByTestId('price-alert-mock')).toBeInTheDocument();
  });

  it('renders the RegisterAccountFields component', () => {
    renderComponent();
    expect(screen.getByTestId('register-account-fields-mock')).toBeInTheDocument();
  });
});
