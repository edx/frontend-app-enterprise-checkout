import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { CheckoutPageDetails } from '@/constants/checkout';
import { renderStepperRoute } from '@/utils/tests';

describe('PlanDetailsPage', () => {
  it('renders the title correctly', () => {
    renderStepperRoute(CheckoutPageDetails.PlanDetails.route);
    expect(screen.getByTestId('stepper-title')).toHaveTextContent('Plan Details');
  });

  it('renders the continue button correctly', () => {
    renderStepperRoute(CheckoutPageDetails.PlanDetails.route);
    expect(screen.getByTestId('stepper-submit-button')).toHaveTextContent('Continue');
  });

  it('renders the PriceAlert component', () => {
    renderStepperRoute(CheckoutPageDetails.PlanDetails.route);
    validateText('Teams subscription');
  });
});

describe('PlanDetailsLoginPage', () => {
  it('renders the title correctly', () => {
    renderStepperRoute(CheckoutPageDetails.PlanDetailsLogin.route);
    expect(screen.getByTestId('stepper-title')).toHaveTextContent('Log in to your account');
  });

  it('renders a button', () => {
    renderStepperRoute(CheckoutPageDetails.PlanDetailsLogin.route);
    expect(screen.getByTestId('stepper-submit-button')).toHaveTextContent('Sign in');
  });
});

describe('PlanDetailsRegistrationPage', () => {
  it('renders the title correctly', () => {
    renderStepperRoute(CheckoutPageDetails.PlanDetailsRegister.route);
    expect(screen.getByTestId('stepper-title')).toHaveTextContent('Create your Account');
  });

  it('renders a button', async () => {
    renderStepperRoute(CheckoutPageDetails.PlanDetailsRegister.route);
    expect(screen.getByTestId('stepper-submit-button')).toHaveTextContent('Register');
  });
});
