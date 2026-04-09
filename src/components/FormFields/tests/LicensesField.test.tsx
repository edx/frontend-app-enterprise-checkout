import { IntlProvider } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { CheckoutStepKey, CheckoutSubstepKey } from '@/constants/checkout';
import { trackFieldBlur } from '@/hooks/useFieldTracking';

import LicensesField from '../LicensesField';

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

jest.mock('@/components/FormFields/Field', () => ({
  __esModule: true,
  default: ({ floatingLabel, placeholder, onBlur }) => (
    <div data-testid="field-mock">
      <div data-testid="floating-label">{floatingLabel}</div>
      <div data-testid="placeholder">{placeholder}</div>
      <button type="button" onClick={onBlur} data-testid="blur-trigger">Trigger Blur</button>
    </div>
  ),
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
});
