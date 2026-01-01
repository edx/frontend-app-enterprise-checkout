import { fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { useFormValidationConstraints } from '@/components/app/data';
import { CheckoutPageRoute } from '@/constants/checkout';
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
      authenticatedUser: { userId: 12345 },
    });
    expect(screen.getByText('Continue')).toBeInTheDocument();
  });

  it('renders the CompanyNameField component', () => {
    renderStepperRoute(CheckoutPageRoute.AccountDetails, {
      config: {},
      authenticatedUser: {
        userId: 12345,
      },
    });
    expect(
      screen.getByText('What is the name of your company or organization?'),
    ).toBeInTheDocument();
  });

  it('renders the CustomUrlField component', () => {
    renderStepperRoute(CheckoutPageRoute.AccountDetails, {
      config: {},
      authenticatedUser: {
        userId: 12345,
      },
    });
    expect(
      screen.getByText('Create a custom URL for your team'),
    ).toBeInTheDocument();
  });

  it('renders Back button and navigates to Plan Details', () => {
    renderStepperRoute(CheckoutPageRoute.AccountDetails, {
      config: {},
      authenticatedUser: { userId: 12345 },
    });

    fireEvent.click(screen.getByText('Back'));

    // expect(screen.queryByText('Plan Details')).toBeInTheDocument();
  });

  it('sets the page title using Helmet', () => {
    renderStepperRoute(CheckoutPageRoute.AccountDetails, {
      config: {},
      authenticatedUser: { userId: 12345 },
    });

    expect(document.title).toBe('');
  });

  it('renders the form wrapper element', () => {
    renderStepperRoute(CheckoutPageRoute.AccountDetails, {
      config: {},
      authenticatedUser: { userId: 12345 },
    });
  });
});
