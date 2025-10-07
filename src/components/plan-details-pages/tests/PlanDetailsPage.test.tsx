import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { useFormValidationConstraints } from '@/components/app/data';
import useBFFContext from '@/components/app/data/hooks/useBFFContext';
import { CheckoutPageRoute } from '@/constants/checkout';
import { renderStepperRoute } from '@/utils/tests';

jest.mock('@/components/app/data', () => ({
  ...jest.requireActual('@/components/app/data'),
  useFormValidationConstraints: jest.fn(),
}));

jest.mock('@/components/app/data/hooks/useBFFContext');

const mockedUseBFFContext = useBFFContext as unknown as jest.Mock;

describe('PlanDetailsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useFormValidationConstraints as jest.Mock).mockReturnValue({
      data: {
        quantity: {
          min: 5,
          max: 30,
        },
      },
    });
    // Mock useBFFContext to call the select function with raw BFF data
    mockedUseBFFContext.mockImplementation((_userId, options) => {
      const rawData = {
        pricing: {
          defaultByLookupKey: 'test-subscription',
          prices: [
            {
              id: 'price_test123',
              product: 'prod_test123',
              lookupKey: 'test-subscription',
              recurring: {
                interval: 'year',
              },
              currency: 'usd',
              unitAmount: 99900,
              unitAmountDecimal: '999.00',
            },
          ],
        },
      };

      // Call the select function if provided to test the transformation logic
      const transformedData = options?.select ? options.select(rawData) : rawData;

      return { data: transformedData };
    });
  });

  it('renders the price alert', () => {
    renderStepperRoute(CheckoutPageRoute.PlanDetails);
    expect(screen.getByTestId('price-alert')).toHaveTextContent('Teams subscription');
    expect(screen.getByTestId('price-alert')).toHaveTextContent('999/yr');
  });

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

describe('PlanDetailsPage - authenticated user', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useFormValidationConstraints as jest.Mock).mockReturnValue({
      data: {
        quantity: {
          min: 5,
          max: 30,
        },
      },
    });
  });

  it('renders authenticated user info when authenticatedUser exists', () => {
    const mockUser = {
      email: 'user@example.com',
      name: 'Test User',
      username: 'testuser',
      country: 'US',
    } as AuthenticatedUser;

    renderStepperRoute(
      CheckoutPageRoute.PlanDetails,
      { config: {}, authenticatedUser: mockUser },
    );

    validateText(/Signed in as:/i);
    validateText(/Test User.*\(user@example.com\)/i);
  });
});
