import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { CheckoutStepperPath } from '@/constants/checkout';
import { renderStepperRoute } from '@/utils/tests';

describe('PlanDetailsPage', () => {
  it('renders the title correctly', () => {
    renderStepperRoute(CheckoutStepperPath.PlanDetailsRoute);
    expect(screen.getByTestId('stepper-title')).toHaveTextContent('Plan Details');
  });

  it('renders the continue button correctly', () => {
    renderStepperRoute(CheckoutStepperPath.PlanDetailsRoute);
    expect(screen.getByTestId('stepper-submit-button')).toHaveTextContent('Continue');
  });

  it('renders the PriceAlert component', () => {
    renderStepperRoute(CheckoutStepperPath.PlanDetailsRoute);
    validateText('Teams subscription');
  });
});

describe('PlanDetailsLoginPage', () => {
  it('renders the title correctly', () => {
    renderStepperRoute(CheckoutStepperPath.LoginRoute);
    expect(screen.getByTestId('stepper-title')).toHaveTextContent('Log in to your account');
  });

  it('renders a button', () => {
    renderStepperRoute(CheckoutStepperPath.LoginRoute);
    expect(screen.getByTestId('stepper-submit-button')).toHaveTextContent('Sign in');
  });

  it('renders the PriceAlert component', () => {
    renderStepperRoute(CheckoutStepperPath.PlanDetailsRoute);
    validateText('Teams subscription');
  });
});

describe('PlanDetailsRegistrationPage', () => {
  it('renders the title correctly', () => {
    renderStepperRoute(CheckoutStepperPath.RegisterRoute);
    expect(screen.getByTestId('stepper-title')).toHaveTextContent('Create your Account');
  });

  it('renders a button', async () => {
    renderStepperRoute(CheckoutStepperPath.RegisterRoute);
    expect(screen.getByTestId('stepper-submit-button')).toHaveTextContent('Register');
  });

  it('renders the PriceAlert component', () => {
    renderStepperRoute(CheckoutStepperPath.PlanDetailsRoute);
    validateText('Teams subscription');
  });
});
