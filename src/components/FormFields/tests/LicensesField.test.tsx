import { getConfig } from '@edx/frontend-platform/config';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { CheckoutStepKey, CheckoutSubstepKey } from '@/constants/checkout';
import { trackFieldBlur } from '@/hooks/useFieldTracking';

import LicensesField from '../LicensesField';

jest.mock('@edx/frontend-platform/config', () => ({
  getConfig: jest.fn(() => ({})),
}));

// Mock the form object
const mockForm = {
  formState: {
    errors: {},
    touchedFields: {},
  },
  register: jest.fn().mockReturnValue({}),
};

// Mock tracking
jest.mock('@/hooks/useFieldTracking', () => ({
  trackFieldBlur: jest.fn(),
}));

// Mock useCurrentStep
jest.mock('@/hooks/useCurrentStep', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    currentStepKey: 'plan-details',
    currentSubstepKey: 'login',
  })),
}));
const mockTrackFieldBlur = trackFieldBlur as jest.Mock;

// Mock BFF context hook
const mockUseBFFContext = jest.fn(() => ({
  data: {
    checkoutIntent: { id: 123 },
  },
}));
jest.mock('@/components/app/data/hooks/useBFFContext', () => ({
  __esModule: true,
  default: (...args: any[]) => (mockUseBFFContext as any)(...args),
}));

// Mock form validation constraints (used to build the max-quantity contact-link message)
jest.mock('@/components/app/data', () => ({
  useFormValidationConstraints: jest.fn(() => ({ data: null })),
}));

jest.mock('@/components/FormFields/Field', () => ({
  __esModule: true,
  default: ({
    floatingLabel, placeholder, onBlur, children, form, name,
  }: any) => {
    const fieldError = form?.formState?.errors?.[name];
    const isInvalid = !!fieldError;
    const errorMessage = fieldError?.message;

    const defaultControl = (
      <div data-testid="field-mock">
        <div data-testid="floating-label">{floatingLabel}</div>
        <div data-testid="placeholder">{placeholder}</div>
        <button type="button" onClick={onBlur} data-testid="blur-trigger">Trigger Blur</button>
      </div>
    );
    const defaultErrorFeedback = isInvalid && errorMessage ? (
      <div data-testid="default-error-feedback">{errorMessage}</div>
    ) : null;

    if (typeof children === 'function') {
      return children({
        defaultControl,
        defaultErrorFeedback,
        isValid: !isInvalid,
        isInvalid,
        errorMessage,
        trailingElement: null,
      });
    }

    return <>{defaultControl}{defaultErrorFeedback}</>;
  },
}));

describe('LicensesField', () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  const mockAuthenticatedUser = {
    userId: 1,
    username: 'test-user',
    roles: [],
    administrator: false,
  };

  const renderComponent = () => render(
    <QueryClientProvider client={queryClient}>
      <AppContext.Provider value={{ authenticatedUser: mockAuthenticatedUser }}>
        <IntlProvider locale="en">
          <LicensesField form={mockForm as any} />
        </IntlProvider>
      </AppContext.Provider>
    </QueryClientProvider>,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the title correctly', () => {
    renderComponent();
    validateText('Number of licenses', { selector: 'h3' });
  });

  it('renders the description correctly', () => {
    renderComponent();
    validateText('Enter in the number of licenses you want to purchase. As an administrator, you can issue and swap licenses between employees.');
  });

  it('renders the field with correct labels', () => {
    renderComponent();
    expect(screen.getByTestId('floating-label')).toHaveTextContent('Number of licenses');
    expect(screen.getByTestId('placeholder')).toHaveTextContent('eg. 10');
  });

  it('should call tracking handler on blur', () => {
    renderComponent();
    const blurTrigger = screen.getByTestId('blur-trigger');
    blurTrigger.click();
    expect(mockTrackFieldBlur).toHaveBeenCalledTimes(1);
  });

  it('should pass correct step and substep keys from useCurrentStep on blur', () => {
    renderComponent();
    const blurTrigger = screen.getByTestId('blur-trigger');
    blurTrigger.click();

    expect(mockTrackFieldBlur).toHaveBeenCalledWith(expect.objectContaining({
      step: CheckoutStepKey.PlanDetails,
      substep: CheckoutSubstepKey.Login,
    }));
  });

  it('should pass null checkoutIntentId for unauthenticated user', () => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock unauthenticated user and no bff context data
    mockUseBFFContext.mockReturnValue({ data: null } as any);

    render(
      <QueryClientProvider client={queryClient}>
        <AppContext.Provider value={{ authenticatedUser: null }}>
          <IntlProvider locale="en">
            <LicensesField form={mockForm as any} />
          </IntlProvider>
        </AppContext.Provider>
      </QueryClientProvider>,
    );

    const blurTrigger = screen.getByTestId('blur-trigger');
    blurTrigger.click();

    expect(mockTrackFieldBlur).toHaveBeenCalledWith(expect.objectContaining({
      checkoutIntentId: null,
    }));
  });

  describe('quantity max-error contact link', () => {
    const teamsUrl = 'https://example.com/teams';
    const essentialsUrl = 'https://example.com/essentials';

    afterEach(() => {
      sessionStorage.removeItem('isEssentials');
    });

    const renderWithQuantityError = (errorType: string, message: string) => render(
      <QueryClientProvider client={queryClient}>
        <AppContext.Provider value={{ authenticatedUser: mockAuthenticatedUser }}>
          <IntlProvider locale="en">
            <LicensesField form={{
              ...mockForm,
              formState: {
                ...mockForm.formState,
                errors: { quantity: { type: errorType, message } },
              },
            } as any}
            />
          </IntlProvider>
        </AppContext.Provider>
      </QueryClientProvider>,
    );

    it('renders a working Teams contact-us link for the max-quantity error', () => {
      sessionStorage.removeItem('isEssentials');
      (getConfig as jest.Mock).mockReturnValue({
        TEAMS_PRODUCT_URL: teamsUrl,
        ESSENTIALS_PRODUCT_URL: essentialsUrl,
      });

      renderWithQuantityError('too_big', 'You can only have up to 30 licenses on the Teams plan. Either decrease the number of licenses or choose a different plan.');

      const link = screen.getByRole('link', { name: /contact us/i });
      expect(link).toHaveAttribute('href', teamsUrl);
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('renders the Essentials contact-us link (a different URL) when in the Essentials flow', () => {
      sessionStorage.setItem('isEssentials', 'true');
      (getConfig as jest.Mock).mockReturnValue({
        TEAMS_PRODUCT_URL: teamsUrl,
        ESSENTIALS_PRODUCT_URL: essentialsUrl,
      });

      renderWithQuantityError('too_big', 'You can only have up to 30 licenses on the Essentials plan. Either decrease the number of licenses or choose a different plan.');

      const link = screen.getByRole('link', { name: /contact us/i });
      expect(link).toHaveAttribute('href', essentialsUrl);
    });

    it('does not render a contact-us link for a non-maximum quantity error', () => {
      (getConfig as jest.Mock).mockReturnValue({
        TEAMS_PRODUCT_URL: teamsUrl,
        ESSENTIALS_PRODUCT_URL: essentialsUrl,
      });

      renderWithQuantityError('too_small', 'You must have at least 5 licenses');

      expect(screen.queryByRole('link', { name: /contact us/i })).not.toBeInTheDocument();
      expect(screen.getByTestId('default-error-feedback')).toHaveTextContent('You must have at least 5 licenses');
    });

    it('falls back to the plain default error feedback when the product URL is not configured', () => {
      sessionStorage.removeItem('isEssentials');
      (getConfig as jest.Mock).mockReturnValue({
        TEAMS_PRODUCT_URL: null,
        ESSENTIALS_PRODUCT_URL: null,
      });
      const plainMessage = 'You can only have up to 30 licenses on the Teams plan. Either decrease the number of licenses or choose a different plan.';

      renderWithQuantityError('too_big', plainMessage);

      expect(screen.queryByRole('link', { name: /contact us/i })).not.toBeInTheDocument();
      expect(screen.getByTestId('default-error-feedback')).toHaveTextContent(plainMessage);
    });
  });
});
