import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { CheckoutPageRoute } from '@/constants/checkout';
import { renderStepperRoute } from '@/utils/tests';

// jest.mock('@')

describe('BillingDetailsPage', () => {
  it('renders the title correctly', () => {
    renderStepperRoute(CheckoutPageRoute.BillingDetails, {
      authenticatedUser: {
        userId: 'test-id',
      },
    } as any);
    expect(screen.getByTestId('stepper-title')).toHaveTextContent('Billing Details');
  });

  it('renders the purchase button correctly', () => {
    renderStepperRoute(CheckoutPageRoute.BillingDetails, {
      authenticatedUser: {
        userId: 'test-id',
      },
    } as any);
    validateText('Purchase Now');
  });

  it('renders the DataPrivacyPolicyField component', () => {
    renderStepperRoute(CheckoutPageRoute.BillingDetails, {
      authenticatedUser: {
        userId: 'test-id',
      },
    } as any);
    validateText('Data Privacy Policy and Master Service Agreement');
  });
});

describe('BillingDetailsSuccessPage', () => {
  it('renders the title correctly', () => {
    renderStepperRoute(CheckoutPageRoute.BillingDetailsSuccess);
    expect(screen.getByTestId('stepper-title')).toHaveTextContent('Thank you, Don.');
  });

  it('renders the OrderDetails component', () => {
    renderStepperRoute(CheckoutPageRoute.BillingDetailsSuccess);
    validateText('Order Details');
    validateText('You have purchased an edX team\'s subscription.');
  });

  it('renders the SuccessHeading component', () => {
    renderStepperRoute(CheckoutPageRoute.BillingDetailsSuccess);
    validateText((content) => content.includes('Welcome to edX for teams!'));
    expect(screen.getByAltText('Celebration of subscription purchase success')).toBeInTheDocument();
  });
});
