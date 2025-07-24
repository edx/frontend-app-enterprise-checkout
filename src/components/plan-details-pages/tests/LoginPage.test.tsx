import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { CheckoutStepKey } from '@/components/Stepper/constants';
import { renderWithRouterAndStepperProvider } from '@/utils/tests';

import LoginPage from '../LoginPage';

// Mock the hooks and components
jest.mock('@/hooks/useCheckoutFormStore', () => ({
  __esModule: true,
  default: () => ({
    formData: { planDetailsLogin: {} },
    setFormData: jest.fn(),
  }),
}));

// Keep mocks for complex components for now
jest.mock('@/components/FormFields/LoginFields', () => ({
  __esModule: true,
  default: () => <div data-testid="login-fields-mock" />,
}));

jest.mock('@/components/PriceAlert/PriceAlert', () => ({
  __esModule: true,
  default: () => <div data-testid="price-alert-mock" />,
}));

describe('LoginPage', () => {
  const renderComponent = () => renderWithRouterAndStepperProvider(
    <LoginPage />,
    CheckoutStepKey.PlanDetails,
  );

  it('renders the title correctly', () => {
    renderComponent();
    expect(screen.getByText('Log in to your account')).toBeInTheDocument();
  });

  it('renders the register button correctly', () => {
    renderComponent();
    expect(screen.getByText('Register')).toBeInTheDocument();
  });

  it('renders the PriceAlert component', () => {
    renderComponent();
    expect(screen.getByTestId('price-alert-mock')).toBeInTheDocument();
  });

  it('renders the LoginFields component', () => {
    renderComponent();
    expect(screen.getByTestId('login-fields-mock')).toBeInTheDocument();
  });
});
