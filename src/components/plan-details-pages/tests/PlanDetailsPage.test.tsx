import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { CheckoutPageRoute } from '@/constants/checkout';
import { renderStepperRoute } from '@/utils/tests';

describe('PlanDetailsPage', () => {
  it('renders the title correctly', () => {
    renderStepperRoute(CheckoutPageRoute.PlanDetails);
    expect(screen.getByTestId('stepper-title')).toHaveTextContent('Plan Details');
  });

  it('renders the continue button correctly', () => {
    renderStepperRoute(CheckoutPageRoute.PlanDetails);
    expect(screen.getByTestId('stepper-submit-button')).toHaveTextContent('Continue');
  });

  it('renders the PriceAlert component', () => {
    renderStepperRoute(CheckoutPageRoute.PlanDetails);
    validateText('Teams subscription');
  });
});

describe('PlanDetailsLoginPage', () => {
  it('renders the title correctly', () => {
    renderStepperRoute(CheckoutPageRoute.PlanDetailsLogin);
    expect(screen.getByTestId('stepper-title')).toHaveTextContent('Log in to your account');
  });

  it('renders a button', () => {
    renderStepperRoute(CheckoutPageRoute.PlanDetailsLogin);
    expect(screen.getByTestId('stepper-submit-button')).toHaveTextContent('Sign in');
  });
});

describe('PlanDetailsRegistrationPage', () => {
  it('renders the title correctly', () => {
    renderStepperRoute(CheckoutPageRoute.PlanDetailsRegister);
    expect(screen.getByTestId('stepper-title')).toHaveTextContent('Create your Account');
  });

  it('renders a button', async () => {
    renderStepperRoute(CheckoutPageRoute.PlanDetailsRegister);
    expect(screen.getByTestId('stepper-submit-button')).toHaveTextContent('Register');
  });
});
