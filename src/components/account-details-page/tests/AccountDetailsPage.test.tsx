import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

import { useFormValidationConstraints } from '@/components/app/data';
import { CheckoutPageRoute, EssentialsPageRoute } from '@/constants/checkout';
import { renderStepperRoute } from '@/utils/tests';

jest.mock('@/components/app/data', () => ({
  ...jest.requireActual('@/components/app/data'),
  useFormValidationConstraints: jest.fn(),
}));

describe('AccountDetailsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useFormValidationConstraints as jest.Mock).mockReturnValue({
      data: {
        enterpriseSlug: {
          minLength: 3,
          maxLength: 30,
          pattern: /^[a-z0-9-]+$/,
        },
      },
    });
  });

  it('renders the title correctly', () => {
    renderStepperRoute(CheckoutPageRoute.AccountDetails, {
      config: {},
      authenticatedUser: {
        userId: 12345,
      },
    });
    expect(screen.getByTestId('stepper-title')).toHaveTextContent('Account Details');
  });

  it('renders the continue button correctly', () => {
    renderStepperRoute(CheckoutPageRoute.AccountDetails, {
      config: {},
      authenticatedUser: {
        userId: 12345,
      },
    });
    validateText('Continue');
  });

  it('renders the CompanyNameField component', () => {
    renderStepperRoute(CheckoutPageRoute.AccountDetails, {
      config: {},
      authenticatedUser: {
        userId: 12345,
      },
    });
    validateText('What is the name of your company or organization?');
  });

  it('renders the CustomUrlField component', () => {
    renderStepperRoute(CheckoutPageRoute.AccountDetails, {
      config: {},
      authenticatedUser: {
        userId: 12345,
      },
    });
    validateText('Create a custom URL for your team');
  });

  it('navigates back to plan details in essentials flow', async () => {
    const user = userEvent.setup();
    sessionStorage.setItem('isEssentials', 'true');

    renderStepperRoute(EssentialsPageRoute.AccountDetails, {
      config: {},
      authenticatedUser: {
        userId: 12345,
      },
    });

    await user.click(screen.getByRole('button', { name: 'Back' }));

    expect(screen.getByTestId('stepper-title')).toHaveTextContent('Plan Details');
    sessionStorage.removeItem('isEssentials');
  });
});
