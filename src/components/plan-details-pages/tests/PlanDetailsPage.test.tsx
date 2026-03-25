import { getConfig } from '@edx/frontend-platform/config';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
// eslint-disable-next-line import/order
import { sendTrackEvent } from '@edx/frontend-platform/analytics';

import { useFormValidationConstraints } from '@/components/app/data';
import useBFFContext from '@/components/app/data/hooks/useBFFContext';
import { camelCasedCheckoutContextResponseFactory } from '@/components/app/data/services/__factories__';
import { validateFieldDetailed } from '@/components/app/data/services/validation';
import { CheckoutPageRoute, CheckoutStepKey, CheckoutSubstepKey, DataStoreKey } from '@/constants/checkout';
import EVENT_NAMES, { PLAN_TYPE } from '@/constants/events';
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

// Mock useLoginMutation for testing
let loginMutateSpy: jest.Mock = jest.fn();
jest.mock('@/components/app/data/hooks/useLoginMutation', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    get mutate() { return loginMutateSpy; },
    isPending: false,
    isSuccess: false,
    isError: false,
  })),
}));

let createCheckoutIntentMutateSpy: jest.Mock = jest.fn();
jest.mock('@/components/app/data/hooks/useCreateCheckoutIntentMutation', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    get mutate() { return createCheckoutIntentMutateSpy; },
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

<<<<<<< HEAD
jest.mock('@edx/frontend-platform/config', () => ({
  getConfig: jest.fn(() => ({
    FEATURE_SELF_SERVICE_PURCHASING: true,
    FEATURE_SELF_SERVICE_PURCHASING_KEY: 'test-key',
    FEATURE_SELF_SERVICE_ESSENTIALS: true,
    FEATURE_SELF_SERVICE_ESSENTIALS_KEY: 'test_essentials_key',
    FEATURE_SELF_SERVICE_SITE_KEY: 'test_site_key',
  })),
=======
jest.mock('@edx/frontend-platform/logging', () => ({
  logError: jest.fn(),
  logInfo: jest.fn(),
}));

jest.mock('@edx/frontend-platform/analytics', () => ({
  sendTrackEvent: jest.fn(),
>>>>>>> 4a7deab (feat: SSP-TELEMETRY-FE - Add comprehensive tests and documentation for tracking implementation)
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
    (getConfig as jest.Mock).mockReturnValue({
      FEATURE_SELF_SERVICE_PURCHASING: 'true',
      FEATURE_SELF_SERVICE_PURCHASING_KEY: 'test_purchasing_key',
      FEATURE_SELF_SERVICE_SITE_KEY: 'test_site_key',
    });

    renderStepperRoute(CheckoutPageRoute.PlanDetails);

    expect(screen.getByTestId('price-alert')).toBeInTheDocument();

    expect(screen.getByTestId('price-alert')).toHaveTextContent('Teams subscription');
    expect(screen.getByTestId('price-alert')).toHaveTextContent('999/yr');
  });

  it('renders the title correctly', () => {
    renderStepperRoute(CheckoutPageRoute.PlanDetails);
    expect(screen.getByTestId('stepper-title')).toHaveTextContent('Plan Details');
  });

  it('fires page view tracking event for PlanDetails step', () => {
    renderStepperRoute(CheckoutPageRoute.PlanDetails);

    expect(sendTrackEvent).toHaveBeenCalledWith(
      EVENT_NAMES.SUBSCRIPTION_CHECKOUT.CHECKOUT_PAGE_VIEWED,
      expect.objectContaining({
        step: CheckoutStepKey.PlanDetails,
        plan_type: PLAN_TYPE.TEAMS,
      }),
    );
  });

  it('fires page view tracking event for Registration step (Register)', () => {
    // Navigate to Register substep
    renderStepperRoute(`${CheckoutPageRoute.PlanDetails}/register`);

    expect(sendTrackEvent).toHaveBeenCalledWith(
      EVENT_NAMES.SUBSCRIPTION_CHECKOUT.CHECKOUT_PAGE_VIEWED,
      expect.objectContaining({
        step: CheckoutSubstepKey.Register,
        plan_type: PLAN_TYPE.TEAMS,
      }),
    );
  });

  it('renders the continue button correctly', () => {
    renderStepperRoute(CheckoutPageRoute.PlanDetails);
    expect(screen.getByTestId('stepper-submit-button')).toHaveTextContent('Continue');
  });

  it('renders the PriceAlert component', () => {
    renderStepperRoute(CheckoutPageRoute.PlanDetails);
    validateText('Teams subscription');
  });

  it('does NOT render PriceAlert for Essentials PlanDetails', () => {
    (getConfig as jest.Mock).mockReturnValue({
      FEATURE_SELF_SERVICE_PURCHASING: 'true',
      FEATURE_SELF_SERVICE_PURCHASING_KEY: 'test_purchasing_key',
      FEATURE_SELF_SERVICE_SITE_KEY: 'test_site_key',
    });

    renderStepperRoute('/essentials/plan-details');

    expect(
      screen.queryByTestId('price-alert'),
    ).not.toBeInTheDocument();
  });

  it('hides PriceAlert for Essentials even when purchasing feature is enabled', () => {
    (getConfig as jest.Mock).mockReturnValue({
      FEATURE_SELF_SERVICE_PURCHASING: true,
      FEATURE_SELF_SERVICE_PURCHASING_KEY: 'test_purchasing_key',
      FEATURE_SELF_SERVICE_SITE_KEY: null,
    });

    renderStepperRoute('/essentials/plan-details');

    expect(
      screen.queryByText(/Teams subscription/i),
    ).not.toBeInTheDocument();
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

    (getConfig as jest.Mock).mockReturnValue({
      FEATURE_SELF_SERVICE_PURCHASING: 'true',
      FEATURE_SELF_SERVICE_PURCHASING_KEY: 'test_purchasing_key',
      FEATURE_SELF_SERVICE_SITE_KEY: 'test_site_key',
      TERMS_OF_SERVICE_URL: 'https://example.com/terms',
      PRIVACY_POLICY_URL: 'https://example.com/privacy',
    });

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

  it('calls register mutation without captchaToken when reCAPTCHA token is null', async () => {
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

    // Assert the register mutation was called with payload lacking captchaToken
    await waitFor(() => expect(mutateSpy).toHaveBeenCalled());
    const payload = (mutateSpy as jest.Mock).mock.calls[0][0];

    expect(payload).toMatchObject({
      name: 'Admin User',
      email: 'admin@example.com',
      username: 'myuser',
      password: 'password-1234',
      country: 'US',
    });
    expect(payload).not.toHaveProperty('captchaToken');
  });
});

describe('PlanDetailsRegistrationPage - Email Validation Error Handling', () => {
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

    setupBFFContextMock();

    // Pre-populate the plan details form data
    checkoutFormStore.setState((state: any) => ({
      ...state,
      formData: {
        ...state.formData,
        [DataStoreKey.PlanDetails]: {
          adminEmail: 'invalid@unauthorized-domain.com',
          fullName: 'Test User',
          country: 'US',
        },
      },
    }));
  });

  it('displays email validation error from 400 response on registration form', async () => {
    const user = userEvent.setup();

    // Mock useRegisterMutation to simulate error response
    const useRegisterMutation = (await import('@/components/app/data/hooks/useRegisterMutation')).default as unknown as jest.Mock;

    let onErrorCallback: (errorMessage: string, errorData?: any) => void;

    useRegisterMutation.mockImplementation(({ onError }: any) => {
      onErrorCallback = onError;
      return {
        mutate: jest.fn(() => {
          // Simulate 400 error response with email validation error
          onErrorCallback('Registration failed', {
            errorCode: 'validation-error',
            email: [{ userMessage: 'Email domain is not authorized for this purchase.' }],
          });
        }),
        isPending: false,
        isSuccess: false,
        isError: false,
      };
    });

    renderStepperRoute(CheckoutPageRoute.PlanDetailsRegister);

    // Fill in registration form fields
    await user.type(screen.getByLabelText(/public username/i), 'testuser');
    await user.type(screen.getByLabelText(/^password$/i), 'SecurePass123!');
    await user.type(screen.getByLabelText(/confirm password/i), 'SecurePass123!');

    // Submit the form
    const submitButton = screen.getByTestId('stepper-submit-button');
    await user.click(submitButton);

    // Wait for and verify the email error is displayed in the form
    await waitFor(() => {
      const emailErrorElement = screen.getByText('Email domain is not authorized for this purchase.');
      expect(emailErrorElement).toBeInTheDocument();
    });
  });
});

describe('PlanDetailsPage - Button Pending State', () => {
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

    // Default mock for validateFieldDetailed
    (validateFieldDetailed as jest.Mock).mockResolvedValue({
      isValid: true,
      validationDecisions: {},
    });

    setupBFFContextMock();

    // Reset mutation spies
    createCheckoutIntentMutateSpy = jest.fn();
    loginMutateSpy = jest.fn();

    checkoutFormStore.setState((state: any) => ({
      ...state,
      formData: {
        ...state.formData,
        [DataStoreKey.PlanDetails]: {
          adminEmail: 'admin@example.com',
          fullName: 'Admin User',
          country: 'US',
          quantity: 10,
        },
      },
    }));
  });

  it('button enters pending state immediately when clicked and remains disabled until API completes', async () => {
    const user = userEvent.setup();

    const mockUser = {
      email: 'user@example.com',
      name: 'Test User',
      username: 'testuser',
      userId: 123,
      country: 'US',
    } as AuthenticatedUser;

    renderStepperRoute(CheckoutPageRoute.PlanDetails, {
      config: {},
      authenticatedUser: mockUser,
    });

    const quantityInput = await screen.findByLabelText(/number of licenses/i);
    await user.clear(quantityInput);
    await user.type(quantityInput, '10');

    const submitButton = screen.getByTestId('stepper-submit-button');

    expect(submitButton).not.toHaveAttribute('aria-disabled', 'true');
    expect(submitButton).toHaveTextContent('Continue');

    await user.click(submitButton);

    await waitFor(() => {
      expect(submitButton).toHaveTextContent('Submitting...');
    }, { timeout: 100 }); // Short timeout because it should be immediate

    expect(submitButton).toHaveAttribute('aria-disabled', 'true');

    expect(submitButton.querySelector('.icon-spin')).toBeInTheDocument();

    await waitFor(() => {
      expect(createCheckoutIntentMutateSpy).toHaveBeenCalled();
    });

    // Try clicking again while pending - should not trigger another mutation call
    await user.click(submitButton);
    expect(createCheckoutIntentMutateSpy).toHaveBeenCalledTimes(1);
  });

  it('button shows pending state for login mutation', async () => {
    const user = userEvent.setup();

    checkoutFormStore.setState((state: any) => ({
      ...state,
      formData: {
        ...state.formData,
        [DataStoreKey.PlanDetails]: {
          adminEmail: 'user@example.com',
          password: 'password123',
          fullName: 'Admin User',
          country: 'US',
          quantity: 10,
        },
      },
    }));

    renderStepperRoute(CheckoutPageRoute.PlanDetailsLogin, {
      config: {},
      authenticatedUser: null,
    });

    const submitButton = await screen.findByTestId('stepper-submit-button');

    expect(submitButton).toHaveTextContent('Sign in');

    await user.click(submitButton);

    await waitFor(() => {
      expect(submitButton).toHaveTextContent('Submitting...');
    }, { timeout: 100 });

    expect(submitButton).toHaveAttribute('aria-disabled', 'true');

    await waitFor(() => {
      expect(loginMutateSpy).toHaveBeenCalled();
    });
  });

  it('button is non-interactable when disabled during pending state', async () => {
    const user = userEvent.setup();

    const mockUser = {
      email: 'user@example.com',
      name: 'Test User',
      username: 'testuser',
      userId: 123,
      country: 'US',
    } as AuthenticatedUser;

    renderStepperRoute(CheckoutPageRoute.PlanDetails, {
      config: {},
      authenticatedUser: mockUser,
    });

    const quantityInput = await screen.findByLabelText(/number of licenses/i);
    await user.clear(quantityInput);
    await user.type(quantityInput, '10');

    const submitButton = screen.getByTestId('stepper-submit-button');

    await user.click(submitButton);

    await waitFor(() => {
      expect(submitButton).toHaveTextContent('Submitting...');
    });

    expect(submitButton).toHaveAttribute('aria-disabled', 'true');

    // Attempt multiple rapid clicks - should not trigger additional mutations
    await user.click(submitButton);
    await user.click(submitButton);
    await user.click(submitButton);

    // Mutation should only be called once
    expect(createCheckoutIntentMutateSpy).toHaveBeenCalledTimes(1);
  });
});

// Essentials navigation tests for Plan Details pages

describe('PlanDetailsPage – Essentials navigation', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Safe defaults for constraints used by the form schema
    (useFormValidationConstraints as jest.Mock).mockReturnValue({
      data: { quantity: { min: 5, max: 30 } },
    });

    // Unless a test overrides it, admin email validation is ok
    (validateFieldDetailed as jest.Mock).mockResolvedValue({
      isValid: true,
      validationDecisions: {},
    });

    // Ensure BFF-context dependent UI (e.g., PurchaseSummary) has data
    setupBFFContextMock();

    // Pre-populate minimal plan details for register/login pages
    checkoutFormStore.setState((state: any) => ({
      ...state,
      formData: {
        ...state.formData,
        [DataStoreKey.PlanDetails]: {
          adminEmail: 'admin@example.com',
          fullName: 'Admin User',
          country: 'US',
          quantity: 10,
        },
      },
    }));
  });

  it('PlanDetails (essentials): unregistered admin email → navigates to /essentials/plan-details/register', async () => {
    const user = userEvent.setup();

    // Simulate "not_registered" decision when submitting the form
    (validateFieldDetailed as jest.Mock).mockImplementation(
      (field, value, _extras, overridePrevious) => {
        if (field === 'adminEmail' && value === 'new@company.com' && overridePrevious === true) {
          return Promise.resolve({
            isValid: false,
            validationDecisions: { adminEmail: { errorCode: 'not_registered' } },
          });
        }
        return Promise.resolve({ isValid: true, validationDecisions: {} });
      },
    );

    renderStepperRoute('/essentials/plan-details');

    // Fill required fields
    await user.type(await screen.findByLabelText(/full name/i), 'John Doe');
    await user.clear(screen.getByLabelText(/work email/i));
    await user.type(screen.getByLabelText(/work email/i), 'new@company.com');
    await user.clear(screen.getByLabelText(/number of licenses/i));
    await user.type(screen.getByLabelText(/number of licenses/i), '10');
    await user.selectOptions(screen.getByLabelText(/country/i), 'US');

    // Submit
    await user.click(screen.getByTestId('stepper-submit-button'));

    await waitFor(() => {
      expect(validateFieldDetailed).toHaveBeenCalledWith(
        'adminEmail',
        'new@company.com',
        {},
        true,
      );
    });

    //  Essentials-prefixed target
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/essentials/plan-details/register');
    });
  });

  it('PlanDetails (essentials): registered/valid admin email → navigates to /essentials/plan-details/login', async () => {
    const user = userEvent.setup();

    // Any non "not_registered" outcome should send to login when unauthenticated
    (validateFieldDetailed as jest.Mock).mockImplementation(
      (field, value, _extras, overridePrevious) => {
        if (field === 'adminEmail' && value === 'existing@company.com' && overridePrevious === true) {
          return Promise.resolve({
            isValid: true,
            validationDecisions: {},
          });
        }
        return Promise.resolve({ isValid: true, validationDecisions: {} });
      },
    );

    renderStepperRoute('/essentials/plan-details');

    // Fill required fields
    await user.type(await screen.findByLabelText(/full name/i), 'Jane Doe');
    await user.clear(screen.getByLabelText(/work email/i));
    await user.type(screen.getByLabelText(/work email/i), 'existing@company.com');
    await user.clear(screen.getByLabelText(/number of licenses/i));
    await user.type(screen.getByLabelText(/number of licenses/i), '10');
    await user.selectOptions(screen.getByLabelText(/country/i), 'US');

    // Submit
    await user.click(screen.getByTestId('stepper-submit-button'));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/essentials/plan-details/login');
    });
  });

  it('PlanDetails (essentials, authenticated): successful checkout intent → navigates to /essentials/account-details', async () => {
    const user = userEvent.setup();

    // Authenticated user
    const mockUser = {
      userId: 123,
      email: 'auth@company.com',
      name: 'Auth User',
      username: 'authuser',
      country: 'US',
    } as AuthenticatedUser;

    // Make the createCheckoutIntent mutation invoke onSuccess immediately
    const useCreateCheckoutIntentMutation = (await import('@/components/app/data/hooks/useCreateCheckoutIntentMutation')).default as unknown as jest.Mock;

    useCreateCheckoutIntentMutation.mockImplementation(({ onSuccess }: any) => ({
      mutate: jest.fn(() => onSuccess?.()),
      isPending: false,
      isSuccess: false,
      isError: false,
    }));

    renderStepperRoute('/essentials/plan-details', { config: {}, authenticatedUser: mockUser });

    // Ensure quantity is present/valid and submit
    await user.clear(await screen.findByLabelText(/number of licenses/i));
    await user.type(screen.getByLabelText(/number of licenses/i), '10');
    await user.click(screen.getByTestId('stepper-submit-button'));

    // Essentials account-details
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/essentials/account-details');
    });
  });

  it('PlanDetailsLogin (essentials): successful login → navigates back to /essentials/plan-details', async () => {
    jest.clearAllMocks();

    // Provide safe constraints so form schema resolves
    (useFormValidationConstraints as jest.Mock).mockReturnValue({
      data: { quantity: { min: 5, max: 30 } },
    });

    // Ensure BFF-context dependent UI has data (same helper you use elsewhere)
    setupBFFContextMock();

    // Pre-populate login page fields in the store so the form is valid on submit
    //    (This mirrors your existing "button shows pending state for login mutation" test.)
    checkoutFormStore.setState((state: any) => ({
      ...state,
      formData: {
        ...state.formData,
        [DataStoreKey.PlanDetails]: {
          adminEmail: 'user@example.com',
          password: 'password123',
          fullName: 'Admin User',
          country: 'US',
          quantity: 10,
        },
      },
    }));

    // Mock useLoginMutation so mutate() immediately calls onSuccess -> triggers navigate()
    const useLoginMutation = (await import('@/components/app/data/hooks/useLoginMutation')).default as unknown as jest.Mock;

    useLoginMutation.mockImplementation(({ onSuccess }: any) => ({
      mutate: jest.fn(() => onSuccess?.()),
      isPending: false,
      isSuccess: false,
      isError: false,
    }));

    // Render directly on the essentials login route
    renderStepperRoute('/essentials/plan-details/login', {
      config: {},
      authenticatedUser: null,
    });

    // Click submit to trigger mutate -> onSuccess -> navigate()
    const submitButton = await screen.findByTestId('stepper-submit-button');
    await userEvent.click(submitButton);

    // Assert the essentials-prefixed navigation happened
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/essentials/plan-details');
    });
  });

  it('PlanDetailsRegister (essentials): successful registration → navigates back to /essentials/plan-details', async () => {
    const user = userEvent.setup();

    // Registration success should navigate back to PlanDetails (essentials)
    const useRegisterMutation = (await import('@/components/app/data/hooks/useRegisterMutation')).default as unknown as jest.Mock;

    useRegisterMutation.mockImplementation(({ onSuccess }: any) => ({
      mutate: jest.fn(() => onSuccess?.()),
      isPending: false,
      isSuccess: false,
      isError: false,
    }));

    renderStepperRoute('/essentials/plan-details/register');

    // Fill minimal editable fields for registration page
    await user.type(screen.getByLabelText(/public username/i), 'newuser');
    await user.type(screen.getByLabelText(/^password$/i), 'P@ssword1234');
    await user.type(screen.getByLabelText(/confirm password/i), 'P@ssword1234');

    // Submit
    await user.click(screen.getByTestId('stepper-submit-button'));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/essentials/plan-details');
    });
  });
});
