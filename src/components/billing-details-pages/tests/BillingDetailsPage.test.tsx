import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { CheckoutPageDetails } from '@/components/Stepper';
import { renderStepperRoute } from '@/utils/tests';

describe('BillingDetailsPage', () => {
  it('renders the title correctly', () => {
    renderStepperRoute(CheckoutPageDetails.BillingDetails.route);
    expect(screen.getByTestId('stepper-title')).toHaveTextContent('Billing Details');
  });

  it('renders the purchase button correctly', () => {
    renderStepperRoute(CheckoutPageDetails.BillingDetails.route);
    validateText('Purchase Now');
  });

  it('renders the DataPrivacyPolicyField component', () => {
    renderStepperRoute(CheckoutPageDetails.BillingDetails.route);
    validateText('Data Privacy Policy and Master Service Agreement');
  });
});

describe('BillingDetailsSuccessPage', () => {
  it('renders the title correctly', () => {
    renderStepperRoute(CheckoutPageDetails.BillingDetailsSuccess.route);
    expect(screen.getByTestId('stepper-title')).toHaveTextContent('Thank you, Don.');
  });

  it('renders the OrderDetails component', () => {
    renderStepperRoute(CheckoutPageDetails.BillingDetailsSuccess.route);
    validateText('Order Details');
    validateText('You have purchased an edX team\'s subscription.');
  });

  it('renders the SuccessHeading component', () => {
    renderStepperRoute(CheckoutPageDetails.BillingDetailsSuccess.route);
    validateText((content) => content.includes('Welcome to edX for teams!'));
    expect(screen.getByAltText('Celebration of subscription purchase success')).toBeInTheDocument();
  });
});
