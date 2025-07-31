import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { CheckoutStepperPath } from '@/components/Stepper';
import { renderStepperRoute } from '@/utils/tests';

describe('BillingDetailsPage', () => {
  it('renders the title correctly', () => {
    renderStepperRoute(CheckoutStepperPath.BillingDetailsRoute);
    expect(screen.getByTestId('stepper-title')).toHaveTextContent('Billing Details');
  });

  it('renders the purchase button correctly', () => {
    renderStepperRoute(CheckoutStepperPath.BillingDetailsRoute);
    validateText('Purchase Now');
  });

  it('renders the DataPrivacyPolicyField component', () => {
    renderStepperRoute(CheckoutStepperPath.BillingDetailsRoute);
    validateText('Data Privacy Policy and Master Service Agreement');
  });
});

describe('BillingDetailsSuccessPage', () => {
  it('renders the title correctly', () => {
    renderStepperRoute(CheckoutStepperPath.SuccessRoute);
    expect(screen.getByTestId('stepper-title')).toHaveTextContent('Thank you, Don.');
  });

  it('renders the OrderDetails component', () => {
    renderStepperRoute(CheckoutStepperPath.SuccessRoute);
    validateText('Order Details');
    validateText('You have purchased an edX team\'s subscription.');
  });

  it('renders the SuccessHeading component', () => {
    renderStepperRoute(CheckoutStepperPath.SuccessRoute);
    validateText((content) => content.includes('Welcome to edX for teams!'));
    expect(screen.getByAltText('Celebration of subscription purchase success')).toBeInTheDocument();
  });
});
