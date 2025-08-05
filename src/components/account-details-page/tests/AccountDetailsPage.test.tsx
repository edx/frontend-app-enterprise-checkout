import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { CheckoutStepperPath } from '@/constants/checkout';
import { renderStepperRoute } from '@/utils/tests';

describe('AccountDetailsPage', () => {
  it('renders the title correctly', () => {
    renderStepperRoute(CheckoutStepperPath.AccountDetailsRoute);
    expect(screen.getByTestId('stepper-title')).toHaveTextContent('Account Details');
  });

  it('renders the continue button correctly', () => {
    renderStepperRoute(CheckoutStepperPath.AccountDetailsRoute);
    validateText('Continue');
  });

  it('renders the OrganizationNameField component', () => {
    renderStepperRoute(CheckoutStepperPath.AccountDetailsRoute);
    validateText('What is the name of your company or organization?');
  });

  it('renders the CustomUrlField component', () => {
    renderStepperRoute(CheckoutStepperPath.AccountDetailsRoute);
    validateText('Create a custom URL for your team');
  });
});
