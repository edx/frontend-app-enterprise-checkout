import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import { useFormValidationConstraints } from '@/components/app/data';
import useBFFContext from '@/components/app/data/hooks/useBFFContext';
import { camelCasedCheckoutContextResponseFactory } from '@/components/app/data/services/__factories__';
import { validateFieldDetailed } from '@/components/app/data/services/validation';
import { CheckoutPageRoute } from '@/constants/checkout';
import { renderStepperRoute } from '@/utils/tests';

jest.mock('@/components/app/data', () => ({
  ...jest.requireActual('@/components/app/data'),
  useFormValidationConstraints: jest.fn(),
}));

jest.mock('@/components/app/data/services/validation', () => ({
  validateFieldDetailed: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('@/components/app/data/hooks/useBFFContext');

const mockedUseBFFContext = useBFFContext as unknown as jest.Mock;

// Mock BFF context response data for testing
const mockBFFContextData = camelCasedCheckoutContextResponseFactory({
  pricing: {
    default_by_lookup_key: 'test-subscription',
    prices: [
      {
        id: 'price_test123',
        product: 'prod_test123',
        lookup_key: 'test-subscription',
        recurring: {
          interval: 'year',
        },
        currency: 'usd',
        unit_amount: 99900,
        unit_amount_decimal: '999.00',
      },
    ],
  },
});

/**
 * Helper function to setup useBFFContext mock with test data
 * This mock simulates the BFF API response and tests the select function transformation
 */
const setupBFFContextMock = () => {
  mockedUseBFFContext.mockImplementation((_userId, options) => {
    const transformedData = options?.select ? options.select(mockBFFContextData) : mockBFFContextData;
    return { data: transformedData };
  });
};

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
    (validateFieldDetailed as jest.Mock).mockReturnValue({
      isValid: true,
      validationDecisions: {},
    });
    // Mock useBFFContext to call the select function with raw BFF data
    setupBFFContextMock();
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
    (validateFieldDetailed as jest.Mock).mockReturnValue({
      isValid: true,
      validationDecisions: {},
    });
    // Mock useBFFContext
    setupBFFContextMock();
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

describe('PlanDetailsPage - Admin Email Validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();

    // Reset any form state that might persist between tests
    localStorage.clear();
    sessionStorage.clear();

    // Reset validateFieldDetailed mock completely
    (validateFieldDetailed as jest.Mock).mockReset();

    (useFormValidationConstraints as jest.Mock).mockReturnValue({
      data: {
        quantity: {
          min: 5,
          max: 30,
        },
      },
    });

    // Default mock for validateFieldDetailed - always return valid structure as Promise
    (validateFieldDetailed as jest.Mock).mockResolvedValue({
      isValid: true,
      validationDecisions: {},
    });

    // Mock useBFFContext to call the select function with raw BFF data
    setupBFFContextMock();
  });

  it('navigates to registration page for unregistered user', async () => {
    const user = userEvent.setup();

    // Mock validation to return 'not_registered' error for form submission call
    (validateFieldDetailed as jest.Mock).mockImplementation((field, value, _extras, overridePrevious) => {
      // Form submission call has overridePrevious=true and specific email
      if (field === 'adminEmail' && value === 'unregistered@example.com' && overridePrevious === true) {
        return Promise.resolve({
          isValid: false,
          validationDecisions: {
            adminEmail: {
              errorCode: 'not_registered',
            },
          },
        });
      }
      // Default response for schema validation calls
      return Promise.resolve({
        isValid: true,
        validationDecisions: {},
      });
    });

    renderStepperRoute(CheckoutPageRoute.PlanDetails);

    // Fill in required form fields using proper user interaction
    // Use findBy to wait for elements to be rendered
    const fullNameInput = await screen.findByLabelText(/full name/i);
    const adminEmailInput = await screen.findByLabelText(/work email/i);
    const quantityInput = await screen.findByLabelText(/number of licenses/i);
    const countrySelect = await screen.findByLabelText(/country of residence/i);

    await user.type(fullNameInput, 'John Doe');
    await user.type(adminEmailInput, 'unregistered@example.com');
    await user.clear(quantityInput);
    await user.type(quantityInput, '10');
    await user.selectOptions(countrySelect, 'US');

    // Submit form
    const submitButton = screen.getByTestId('stepper-submit-button');
    await user.click(submitButton);

    // Wait for validation and navigation
    await waitFor(() => {
      expect(validateFieldDetailed).toHaveBeenCalledWith('adminEmail', 'unregistered@example.com', {}, true);
    });

    // Check that navigation to registration page was called
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(CheckoutPageRoute.PlanDetailsRegister);
    });
  });

  it('navigates to login page for registered user', async () => {
    const user = userEvent.setup();

    // Mock validation to return 'invalid_format' error for form submission call
    (validateFieldDetailed as jest.Mock).mockImplementation((field, value, _extras, overridePrevious) => {
      // Form submission call has overridePrevious=true and specific email
      if (field === 'adminEmail' && value === 'registered@example.com' && overridePrevious === true) {
        return Promise.resolve({
          isValid: false,
          validationDecisions: {
            adminEmail: {
              errorCode: 'invalid_format',
            },
          },
        });
      }
      // Default response for schema validation calls
      return Promise.resolve({
        isValid: true,
        validationDecisions: {},
      });
    });

    renderStepperRoute(CheckoutPageRoute.PlanDetails);

    // Fill in required form fields using proper user interaction
    // Use findBy to wait for elements to be rendered
    const fullNameInput = await screen.findByLabelText(/full name/i);
    const adminEmailInput = await screen.findByLabelText(/work email/i);
    const quantityInput = await screen.findByLabelText(/number of licenses/i);
    const countrySelect = await screen.findByLabelText(/country of residence/i);

    await user.type(fullNameInput, 'John Doe');
    await user.clear(adminEmailInput);
    await user.type(adminEmailInput, 'registered@example.com');
    await user.clear(quantityInput);
    await user.type(quantityInput, '10');
    await user.selectOptions(countrySelect, 'US');

    // Submit form
    const submitButton = screen.getByTestId('stepper-submit-button');
    await user.click(submitButton);

    // Wait for validation and navigation
    await waitFor(() => {
      expect(validateFieldDetailed).toHaveBeenCalledWith('adminEmail', 'registered@example.com', {}, true);
    });

    // Check that navigation to login page was called
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(CheckoutPageRoute.PlanDetailsLogin);
    });
  });

  it('navigates to login page for valid registered user', async () => {
    const user = userEvent.setup();

    // Mock validation to return valid response for form submission call
    (validateFieldDetailed as jest.Mock).mockImplementation((field, value, _extras, overridePrevious) => {
      // Form submission call has overridePrevious=true and specific email
      if (field === 'adminEmail' && value === 'valid@example.com' && overridePrevious === true) {
        return Promise.resolve({
          isValid: true,
          validationDecisions: {},
        });
      }
      // Default response for schema validation calls
      return Promise.resolve({
        isValid: true,
        validationDecisions: {},
      });
    });

    renderStepperRoute(CheckoutPageRoute.PlanDetails);

    // Fill in required form fields using proper user interaction
    // Use findBy to wait for elements to be rendered
    const fullNameInput = await screen.findByLabelText(/full name/i);
    const adminEmailInput = await screen.findByLabelText(/work email/i);
    const quantityInput = await screen.findByLabelText(/number of licenses/i);
    const countrySelect = await screen.findByLabelText(/country of residence/i);

    await user.type(fullNameInput, 'John Doe');
    await user.clear(adminEmailInput);
    await user.type(adminEmailInput, 'valid@example.com');
    await user.clear(quantityInput);
    await user.type(quantityInput, '10');
    await user.selectOptions(countrySelect, 'US');

    // Submit form
    const submitButton = screen.getByTestId('stepper-submit-button');
    await user.click(submitButton);

    // Wait for validation and navigation
    await waitFor(() => {
      expect(validateFieldDetailed).toHaveBeenCalledWith('adminEmail', 'valid@example.com', {}, true);
    });

    // Check that navigation to login page was called (valid user still goes to login for non-authenticated case)
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(CheckoutPageRoute.PlanDetailsLogin);
    });
  });
});
