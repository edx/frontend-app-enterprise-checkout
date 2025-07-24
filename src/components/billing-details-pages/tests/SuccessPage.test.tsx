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

  it('renders the OrderDetails component', () => {
    renderComponent();
    // Test the actual component's content instead of a mock
    expect(screen.getByText('Order Details')).toBeInTheDocument();
    expect(screen.getByText('You have purchased an edX team\'s subscription.')).toBeInTheDocument();
  });

  it('renders the SuccessHeading component', () => {
    renderComponent();
    // Test the actual component's content instead of a mock
    expect(screen.getByText((content) => content.includes('Welcome to edX for teams!'))).toBeInTheDocument();
    expect(screen.getByAltText('Celebration of subscription purchase success')).toBeInTheDocument();
  });
});
