import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { CheckoutPageDetails, CheckoutStepKey } from '@/components/Stepper/constants';
import { renderWithRouterAndStepperProvider } from '@/utils/tests';

import BillingDetailsPage from '../BillingDetailsPage';

// Mock the hooks
jest.mock('@/hooks/useCheckoutFormStore', () => ({
  __esModule: true,
  default: jest.fn((cb) => {
    const defaultState = {
      formData: { BillingDetails: {} },
      setFormData: jest.fn(),
      isAuthenticated: true,
      setIsAuthenticated: jest.fn(),
    };
    return cb(defaultState);
  }),
}));

describe('BillingDetailsPage', () => {
  const renderComponent = () => renderWithRouterAndStepperProvider(
    <BillingDetailsPage />,
    CheckoutStepKey.BillingDetails,
    {
      initialEntries: [CheckoutPageDetails.BillingDetails.route],
    },
  );

  it('renders the title correctly', () => {
    renderComponent();
    expect(screen.getByText('Billing Details')).toBeInTheDocument();
  });

  it('renders the purchase button correctly', () => {
    renderComponent();
    expect(screen.getByText('Purchase Now')).toBeInTheDocument();
  });

  it('renders the DataPrivacyPolicyField component', () => {
    renderComponent();
    // Instead of looking for a mock, we're now testing the actual component
    // The DataPrivacyPolicyField renders a title that we can check for
    expect(screen.getByText('Data Privacy Policy and Master Service Agreement')).toBeInTheDocument();
  });
});
