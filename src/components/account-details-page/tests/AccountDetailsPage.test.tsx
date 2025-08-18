import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { useFormValidationConstraints } from '@/components/app/data';
import { CheckoutPageDetails } from '@/constants/checkout';
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
    renderStepperRoute(CheckoutPageDetails.AccountDetails.route);
    expect(screen.getByTestId('stepper-title')).toHaveTextContent('Account Details');
  });

  it('renders the continue button correctly', () => {
    renderStepperRoute(CheckoutPageDetails.AccountDetails.route);
    validateText('Continue');
  });

  it('renders the CompanyNameField component', () => {
    renderStepperRoute(CheckoutPageDetails.AccountDetails.route);
    validateText('What is the name of your company or organization?');
  });

  it('renders the CustomUrlField component', () => {
    renderStepperRoute(CheckoutPageDetails.AccountDetails.route);
    validateText('Create a custom URL for your team');
  });
});
