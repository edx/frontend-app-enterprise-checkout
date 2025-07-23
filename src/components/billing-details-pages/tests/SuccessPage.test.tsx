import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { CheckoutStepKey } from '@/components/Stepper/constants';
import { renderWithRouterAndStepperProvider } from '@/utils/tests';

import SuccessPage from '../SuccessPage';

describe('SuccessPage', () => {
  const renderComponent = () => renderWithRouterAndStepperProvider(
    <SuccessPage />,
    CheckoutStepKey.BillingDetails,
  );

  it('renders the thank you title correctly', () => {
    renderComponent();
    expect(screen.getByText('Thank you, Don.')).toBeInTheDocument();
  });

  it('renders the DataPrivacyPolicyField component', () => {
    renderComponent();
    // Test the actual component's content instead of a mock
    expect(screen.getByText('Data Privacy Policy and Master Service Agreement')).toBeInTheDocument();
  });

  it('renders the OrderDetails component', () => {
    renderComponent();
    // Test the actual component's content instead of a mock
    expect(screen.getByText('Order Details')).toBeInTheDocument();
    expect(screen.getByText('You have purchased an edX team\'s subscription.')).toBeInTheDocument();
  });
});
