import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { CheckoutStepKey } from '@/components/Stepper/constants';
import { renderWithRouterAndStepperProvider } from '@/utils/tests';

import BillingDetailsPage from '../BillingDetailsPage';

// Mock the hooks
jest.mock('@/hooks/useCheckoutFormStore', () => ({
  __esModule: true,
  default: () => ({
    formData: {
      billingDetails: {},
    },
    setFormData: jest.fn(),
  }),
}));

describe('BillingDetailsPage', () => {
  const renderComponent = () => renderWithRouterAndStepperProvider(
    <BillingDetailsPage />,
    CheckoutStepKey.BillingDetails,
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
