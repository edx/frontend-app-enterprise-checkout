import { IntlProvider } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { CheckoutStepKey } from '@/constants/checkout';
import { useCheckoutFormStore } from '@/hooks/useCheckoutFormStore';
import { trackFieldBlur } from '@/hooks/useFieldTracking';
import { findAvailableSlug, generateSlugFromCompanyName } from '@/utils/checkout';

import CompanyNameField from '../CompanyNameField';

const createMockForm = ({
  errors = {},
  companyName = 'Acme Corp',
  enterpriseSlug = '',
} = {}) => ({
  formState: {
    errors,
    touchedFields: { companyName: true },
  },
  register: jest.fn().mockReturnValue({}),
  getValues: jest.fn((fieldName: string) => {
    if (fieldName === 'companyName') {
      return companyName;
    }
    if (fieldName === 'enterpriseSlug') {
      return enterpriseSlug;
    }
    return undefined;
  }),
  setValue: jest.fn(),
});

jest.mock('@/hooks/useFieldTracking', () => ({
  trackFieldBlur: jest.fn(),
}));

jest.mock('@/hooks/useCheckoutFormStore', () => ({
  useCheckoutFormStore: jest.fn(),
}));

jest.mock('@/utils/checkout', () => ({
  findAvailableSlug: jest.fn(),
  generateSlugFromCompanyName: jest.fn(),
}));

jest.mock('@/hooks/useCurrentStep', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    currentStepKey: 'account-details',
    currentSubstepKey: undefined,
  })),
}));

const mockTrackFieldBlur = trackFieldBlur as jest.Mock;
const mockUseCheckoutFormStore = useCheckoutFormStore as unknown as jest.Mock;
const mockFindAvailableSlug = findAvailableSlug as jest.Mock;
const mockGenerateSlugFromCompanyName = generateSlugFromCompanyName as jest.Mock;

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
  default: ({ floatingLabel, placeholder, form, name, onBlur, disabled }) => {
    const error = form?.formState?.errors[name];
    return (
      <div data-testid="field-mock">
        <div data-testid="floating-label">{floatingLabel}</div>
        <div data-testid="placeholder">{placeholder}</div>
        <div data-testid="disabled-state">{String(Boolean(disabled))}</div>
        {error && <div data-testid="error-message">{error.message}</div>}
        <button type="button" onClick={onBlur} data-testid="blur-trigger">Trigger Blur</button>
      </div>
    );
  },
}));

describe('CompanyNameField', () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  const mockAuthenticatedUser = {
    userId: 1,
    username: 'test-user',
    roles: [],
    administrator: false,
  };

  const renderComponent = (formOptions = {}) => render(
    <QueryClientProvider client={queryClient}>
      <AppContext.Provider value={{ authenticatedUser: mockAuthenticatedUser }}>
        <IntlProvider locale="en">
          <CompanyNameField form={createMockForm(formOptions) as any} />
        </IntlProvider>
      </AppContext.Provider>
    </QueryClientProvider>,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseCheckoutFormStore.mockImplementation((selector: any) => selector({
      formData: {
        PlanDetails: {
          adminEmail: 'admin@example.com',
        },
      },
    }));
    mockGenerateSlugFromCompanyName.mockReturnValue('acme-corp');
    mockFindAvailableSlug.mockResolvedValue('acme-corp-1');
  });

  it('renders the title correctly', () => {
    renderComponent();
    validateText('What is the name of your company or organization?');
  });

  it('renders the field with correct labels', () => {
    renderComponent();
    expect(screen.getByTestId('floating-label')).toHaveTextContent('Company Name');
    expect(screen.getByTestId('placeholder')).toHaveTextContent('Enter your company name');
  });

  it('displays validation error when companyName is invalid', () => {
    renderComponent({
      errors: {
        companyName: {
          type: 'required',
          message: 'Company name is required',
        },
      },
    });
    expect(screen.getByTestId('error-message')).toHaveTextContent('Company name is required');
  });

  it('should call tracking handler on blur', () => {
    renderComponent();
    const blurTrigger = screen.getByTestId('blur-trigger');
    blurTrigger.click();
    expect(mockTrackFieldBlur).toHaveBeenCalledTimes(1);
    expect(mockTrackFieldBlur).toHaveBeenCalledWith(expect.objectContaining({
      fieldName: 'companyName',
    }));
  });

  it('should pass correct step and substep keys from useCurrentStep on blur', () => {
    renderComponent();
    const blurTrigger = screen.getByTestId('blur-trigger');
    blurTrigger.click();

    expect(mockTrackFieldBlur).toHaveBeenCalledWith(expect.objectContaining({
      step: CheckoutStepKey.AccountDetails,
      substep: undefined,
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
            <CompanyNameField form={createMockForm() as any} />
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

  it('generates and sets an available slug when company name is blurred and slug is empty', async () => {
    const form = createMockForm({ companyName: 'Acme Corp', enterpriseSlug: '' }) as any;

    render(
      <QueryClientProvider client={queryClient}>
        <AppContext.Provider value={{ authenticatedUser: mockAuthenticatedUser }}>
          <IntlProvider locale="en">
            <CompanyNameField form={form} />
          </IntlProvider>
        </AppContext.Provider>
      </QueryClientProvider>,
    );

    screen.getByTestId('blur-trigger').click();

    expect(mockGenerateSlugFromCompanyName).toHaveBeenCalledWith('Acme Corp', 30);
    expect(mockFindAvailableSlug).toHaveBeenCalledWith('acme-corp', 'admin@example.com', 30);

    await Promise.resolve();

    expect(form.setValue).toHaveBeenCalledWith('enterpriseSlug', 'acme-corp-1', {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
  });

  it('clears the slug when company name is blank on blur', async () => {
    const form = createMockForm({ companyName: '   ', enterpriseSlug: 'existing-slug' }) as any;

    render(
      <QueryClientProvider client={queryClient}>
        <AppContext.Provider value={{ authenticatedUser: mockAuthenticatedUser }}>
          <IntlProvider locale="en">
            <CompanyNameField form={form} />
          </IntlProvider>
        </AppContext.Provider>
      </QueryClientProvider>,
    );

    screen.getByTestId('blur-trigger').click();
    await Promise.resolve();

    expect(form.setValue).toHaveBeenCalledWith('enterpriseSlug', '', {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
    expect(mockGenerateSlugFromCompanyName).not.toHaveBeenCalled();
  });

  it('does not generate a slug when enterpriseSlug already has a value', async () => {
    const form = createMockForm({ companyName: 'Acme Corp', enterpriseSlug: 'chosen-slug' }) as any;

    render(
      <QueryClientProvider client={queryClient}>
        <AppContext.Provider value={{ authenticatedUser: mockAuthenticatedUser }}>
          <IntlProvider locale="en">
            <CompanyNameField form={form} />
          </IntlProvider>
        </AppContext.Provider>
      </QueryClientProvider>,
    );

    screen.getByTestId('blur-trigger').click();
    await Promise.resolve();

    expect(mockGenerateSlugFromCompanyName).not.toHaveBeenCalled();
    expect(mockFindAvailableSlug).not.toHaveBeenCalled();
    expect(form.setValue).not.toHaveBeenCalled();
  });
});
