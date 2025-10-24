import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import { useFormValidationConstraints } from '@/components/app/data';
import useBFFContext from '@/components/app/data/hooks/useBFFContext';
import { camelCasedCheckoutContextResponseFactory } from '@/components/app/data/services/__factories__';
import { validateFieldDetailed } from '@/components/app/data/services/validation';
import { CheckoutPageRoute, DataStoreKey } from '@/constants/checkout';
import { checkoutFormStore } from '@/hooks/useCheckoutFormStore';
import { renderStepperRoute } from '@/utils/tests';

jest.mock('@/components/app/data', () => ({
  ...jest.requireActual('@/components/app/data'),
  useFormValidationConstraints: jest.fn(),
  useRecaptchaToken: jest.fn(() => ({ getToken: jest.fn().mockResolvedValue('test-token'), isLoading: false, isReady: true })),
  useCheckoutIntent: jest.fn(() => ({ data: {} })),
}));

jest.mock('@/components/app/data/services/validation', () => ({
  validateFieldDetailed: jest.fn(),
}));

// Ensure no network calls are attempted during registration schema validation
jest.mock('@/components/app/data/services/registration', () => ({
  ...jest.requireActual('@/components/app/data/services/registration'),
  validateRegistrationFieldsDebounced: jest.fn().mockResolvedValue({ isValid: true, errors: {} }),
}));

// Mock useRegisterMutation to capture mutate calls
let registerMutateSpy: jest.Mock;
jest.mock('@/components/app/data/hooks/useRegisterMutation', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    get mutate() { return registerMutateSpy; },
    isPending: false,
    isSuccess: false,
    isError: false,
  })),
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('@edx/frontend-platform/config', () => ({
  getConfig: jest.fn().mockReturnValue({
    TERMS_OF_SERVICE_URL: 'https://example.com/terms',
    PRIVACY_POLICY_URL: 'https://example.com/privacy',
    RECAPTCHA_SITE_KEY_WEB: 'test-recaptcha-key',
  }),
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
    // Ensure BFF context-dependent components (e.g., PurchaseSummary) have data
    setupBFFContextMock();
  });

  it('renders the title correctly', () => {
    renderStepperRoute(CheckoutPageRoute.PlanDetailsRegister);
    expect(screen.getByTestId('stepper-title')).toHaveTextContent('Create your Account');
  });

  it('renders a button', async () => {
    renderStepperRoute(CheckoutPageRoute.PlanDetailsRegister);
    expect(screen.getByTestId('stepper-submit-button')).toHaveTextContent('Register');
  });

  it('renders registration form fields correctly', () => {
    renderStepperRoute(CheckoutPageRoute.PlanDetailsRegister);

    // Check that registration form title and description are present
    validateText('Register your edX account', { exact: false });
    validateText('administrator access', { exact: false });

    // Check that all required form fields are present
    expect(screen.getByLabelText(/work email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/public username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/country\/region/i)).toBeInTheDocument();
  });

  it('renders registration disclaimer component', () => {
    renderStepperRoute(CheckoutPageRoute.PlanDetailsRegister);

    // Check that disclaimer text is present - use more flexible matching
    expect(screen.getByText(/creating an account/i)).toBeInTheDocument();
    expect(screen.getByText(/terms of service/i)).toBeInTheDocument();
    expect(screen.getByText(/honor code/i)).toBeInTheDocument();
    expect(screen.getByText(/privacy policy/i)).toBeInTheDocument();
  });

  it('renders disclaimer links with correct destinations', () => {
    // getConfig is mocked at module level to provide test URLs
    renderStepperRoute(CheckoutPageRoute.PlanDetailsRegister);

    // Check that links exist and have correct attributes
    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);

    // At least one link should point to terms URL
    const termsLinks = links.filter(link => link.getAttribute('href') === 'https://example.com/terms');
    expect(termsLinks.length).toBeGreaterThan(0);

    // At least one link should point to privacy URL
    const privacyLinks = links.filter(link => link.getAttribute('href') === 'https://example.com/privacy');
    expect(privacyLinks.length).toBeGreaterThan(0);
  });

  it('displays registration form with all required fields', () => {
    renderStepperRoute(CheckoutPageRoute.PlanDetailsRegister);

    // Check that form fields are present and accessible
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm/i)).toBeInTheDocument();

    // Check that submit button is present
    expect(screen.getByTestId('stepper-submit-button')).toBeInTheDocument();
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

describe('PlanDetailsRegistrationPage - reCAPTCHA null token behavior', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Provide safe constraints
    (useFormValidationConstraints as jest.Mock).mockReturnValue({
      data: {
        quantity: {
          min: 5,
          max: 30,
        },
      },
    });

    // Ensure BFF context-dependent components (e.g., PurchaseSummary) have data
    setupBFFContextMock();

    // Pre-populate the plan details form data so read-only fields are satisfied
    checkoutFormStore.setState((state: any) => ({
      ...state,
      formData: {
        ...state.formData,
        [DataStoreKey.PlanDetails]: {
          adminEmail: 'admin@example.com',
          fullName: 'Admin User',
          country: 'US',
        },
      },
    }));

    // Make reCAPTCHA return null token for this test
    const { useRecaptchaToken } = jest.requireMock('@/components/app/data');
    (useRecaptchaToken as jest.Mock).mockReturnValue(
      { getToken: jest.fn().mockResolvedValue(null), isLoading: false, isReady: true },
    );
  });

  it('calls register mutation without recaptchaToken when reCAPTCHA token is null', async () => {
    registerMutateSpy = jest.fn();
    const user = userEvent.setup();

    // Set up register mutation mock to capture calls
    const useRegisterMutation = (await import('@/components/app/data/hooks/useRegisterMutation')).default as unknown as jest.Mock;
    const mutateSpy = jest.fn();
    useRegisterMutation.mockReturnValue({ mutate: mutateSpy, isPending: false, isSuccess: false, isError: false });

    renderStepperRoute(CheckoutPageRoute.PlanDetailsRegister);

    // Fill in the required editable fields
    await user.type(screen.getByLabelText(/public username/i), 'myuser');
    await user.type(screen.getByLabelText(/^password$/i), 'password-1234');
    await user.type(screen.getByLabelText(/confirm password/i), 'password-1234');

    // Submit the form
    await user.click(screen.getByTestId('stepper-submit-button'));

    // Assert the register mutation was called with payload lacking recaptchaToken
    await waitFor(() => expect(mutateSpy).toHaveBeenCalled());
    const payload = (mutateSpy as jest.Mock).mock.calls[0][0];

    expect(payload).toMatchObject({
      name: 'Admin User',
      email: 'admin@example.com',
      username: 'myuser',
      password: 'password-1234',
      country: 'US',
    });
    expect(payload).not.toHaveProperty('recaptchaToken');
  });
});
