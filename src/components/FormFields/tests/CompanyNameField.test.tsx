import { IntlProvider } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

import { CheckoutStepKey, DataStoreKey } from '@/constants/checkout';
import { trackFieldBlur } from '@/hooks/useFieldTracking';
import { findAvailableSlug, generateSlugFromCompanyName } from '@/utils/checkout';

import CompanyNameField from '../CompanyNameField';

// Mock the form object
const createMockForm = (errors = {}, values = {}) => ({
  formState: {
    errors,
    touchedFields: { companyName: true },
  },
  register: jest.fn().mockReturnValue({}),
  getValues: jest.fn((field?: string) => {
    if (field) {
      return values[field];
    }
    return values;
  }),
  setValue: jest.fn(),
});

// Mock tracking
jest.mock('@/hooks/useFieldTracking', () => ({
  trackFieldBlur: jest.fn(),
}));

// Mock useCurrentStep
jest.mock('@/hooks/useCurrentStep', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    currentStepKey: 'account-details',
    currentSubstepKey: undefined,
  })),
}));

// Mock slug generation utilities
jest.mock('@/utils/checkout', () => ({
  ...jest.requireActual('@/utils/checkout'),
  generateSlugFromCompanyName: jest.fn(),
  findAvailableSlug: jest.fn(),
}));

// Mock useCheckoutFormStore
const mockUseCheckoutFormStore = jest.fn(() => ({
  formData: {
    [DataStoreKey.PlanDetails]: {
      adminEmail: 'admin@test.com',
    },
  },
}));

jest.mock('@/hooks/useCheckoutFormStore', () => ({
  useCheckoutFormStore: (selector: any) => selector(mockUseCheckoutFormStore()),
}));

const mockTrackFieldBlur = trackFieldBlur as jest.Mock;
const mockGenerateSlugFromCompanyName = generateSlugFromCompanyName as jest.Mock;
const mockFindAvailableSlug = findAvailableSlug as jest.Mock;

// Mock BFF context hook
const mockUseBFFContext = jest.fn(() => ({
  data: {
    checkoutIntent: { id: 123, uuid: 'test-uuid-123' },
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
        {error && <div data-testid="error-message">{error.message}</div>}
        {disabled && <div data-testid="field-disabled">Disabled</div>}
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

  const renderComponent = (errors = {}, values = {}) => render(
    <QueryClientProvider client={queryClient}>
      <AppContext.Provider value={{ authenticatedUser: mockAuthenticatedUser }}>
        <IntlProvider locale="en">
          <CompanyNameField form={createMockForm(errors, values) as any} />
        </IntlProvider>
      </AppContext.Provider>
    </QueryClientProvider>,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    mockGenerateSlugFromCompanyName.mockReturnValue('test-slug');
    mockFindAvailableSlug.mockResolvedValue('test-slug');
  });

  it('renders the title correctly', () => {
    renderComponent();
    expect(screen.getByText('What is the name of your company or organization?')).toBeInTheDocument();
  });

  it('renders the field with correct labels', () => {
    renderComponent();
    expect(screen.getByTestId('floating-label')).toHaveTextContent('Company Name');
    expect(screen.getByTestId('placeholder')).toHaveTextContent('Enter your company name');
  });

  it('displays validation error when companyName is invalid', () => {
    renderComponent({
      companyName: {
        type: 'required',
        message: 'Company name is required',
      },
    });
    expect(screen.getByTestId('error-message')).toHaveTextContent('Company name is required');
  });

  it('should call tracking handler on blur', async () => {
    renderComponent({}, { companyName: '', enterpriseSlug: 'existing-slug' });
    const blurTrigger = screen.getByTestId('blur-trigger');
    blurTrigger.click();

    await waitFor(() => {
      expect(mockTrackFieldBlur).toHaveBeenCalledTimes(1);
      expect(mockTrackFieldBlur).toHaveBeenCalledWith(expect.objectContaining({
        fieldName: 'companyName',
      }));
    });
  });

  it('should pass correct step and substep keys from useCurrentStep on blur', async () => {
    renderComponent({}, { companyName: '', enterpriseSlug: 'existing-slug' });
    const blurTrigger = screen.getByTestId('blur-trigger');
    blurTrigger.click();

    await waitFor(() => {
      expect(mockTrackFieldBlur).toHaveBeenCalledWith(expect.objectContaining({
        step: CheckoutStepKey.AccountDetails,
        substep: undefined,
      }));
    });
  });

  it('should pass null checkoutIntentId for unauthenticated user', async () => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock unauthenticated user and no bff context data
    mockUseBFFContext.mockReturnValue({ data: null } as any);

    render(
      <QueryClientProvider client={queryClient}>
        <AppContext.Provider value={{ authenticatedUser: null }}>
          <IntlProvider locale="en">
            <CompanyNameField form={createMockForm({}, { companyName: '', enterpriseSlug: 'slug' }) as any} />
          </IntlProvider>
        </AppContext.Provider>
      </QueryClientProvider>,
    );

    const blurTrigger = screen.getByTestId('blur-trigger');
    blurTrigger.click();

    await waitFor(() => {
      expect(mockTrackFieldBlur).toHaveBeenCalledWith(expect.objectContaining({
        checkoutIntentId: null,
      }));
    });
  });

  describe('slug auto-generation', () => {
    it('generates and populates slug when company name is filled and enterpriseSlug is empty', async () => {
      mockGenerateSlugFromCompanyName.mockReturnValue('acme-corp');
      mockFindAvailableSlug.mockResolvedValue('acme-corp');

      renderComponent({}, {
        companyName: 'ACME Corp',
        enterpriseSlug: '',
      });

      const blurTrigger = screen.getByTestId('blur-trigger');
      blurTrigger.click();

      await waitFor(() => {
        expect(mockGenerateSlugFromCompanyName).toHaveBeenCalledWith('ACME Corp', 30);
        expect(mockFindAvailableSlug).toHaveBeenCalledWith('acme-corp', 'admin@test.com', 30);
      });
    });

    it('does not generate slug if company name is empty', async () => {
      renderComponent({}, {
        companyName: '',
        enterpriseSlug: '',
      });

      const blurTrigger = screen.getByTestId('blur-trigger');
      blurTrigger.click();

      await waitFor(() => {
        expect(mockTrackFieldBlur).toHaveBeenCalled();
      });

      expect(mockGenerateSlugFromCompanyName).not.toHaveBeenCalled();
      expect(mockFindAvailableSlug).not.toHaveBeenCalled();
    });

    it('does not overwrite existing slug value', async () => {
      renderComponent({}, {
        companyName: 'ACME Corp',
        enterpriseSlug: 'existing-slug',
      });

      const blurTrigger = screen.getByTestId('blur-trigger');
      blurTrigger.click();

      await waitFor(() => {
        expect(mockTrackFieldBlur).toHaveBeenCalled();
      });

      expect(mockGenerateSlugFromCompanyName).not.toHaveBeenCalled();
      expect(mockFindAvailableSlug).not.toHaveBeenCalled();
    });

    it('sets slug value with proper form options', async () => {
      const mockForm = createMockForm({}, {
        companyName: 'Test Company',
        enterpriseSlug: '',
      });

      mockGenerateSlugFromCompanyName.mockReturnValue('test-company');
      mockFindAvailableSlug.mockResolvedValue('test-company');

      render(
        <QueryClientProvider client={queryClient}>
          <AppContext.Provider value={{ authenticatedUser: mockAuthenticatedUser }}>
            <IntlProvider locale="en">
              <CompanyNameField form={mockForm as any} />
            </IntlProvider>
          </AppContext.Provider>
        </QueryClientProvider>,
      );

      const blurTrigger = screen.getByTestId('blur-trigger');
      blurTrigger.click();

      await waitFor(() => {
        expect(mockForm.setValue).toHaveBeenCalledWith(
          'enterpriseSlug',
          'test-company',
          {
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true,
          },
        );
      });
    });

    it('handles collision by using incremented slug', async () => {
      const mockForm = createMockForm({}, {
        companyName: 'ACME Corp',
        enterpriseSlug: '',
      });

      mockGenerateSlugFromCompanyName.mockReturnValue('acme-corp');
      mockFindAvailableSlug.mockResolvedValue('acme-corp-1');

      render(
        <QueryClientProvider client={queryClient}>
          <AppContext.Provider value={{ authenticatedUser: mockAuthenticatedUser }}>
            <IntlProvider locale="en">
              <CompanyNameField form={mockForm as any} />
            </IntlProvider>
          </AppContext.Provider>
        </QueryClientProvider>,
      );

      const blurTrigger = screen.getByTestId('blur-trigger');
      blurTrigger.click();

      await waitFor(() => {
        expect(mockForm.setValue).toHaveBeenCalledWith(
          'enterpriseSlug',
          'acme-corp-1',
          expect.any(Object),
        );
      });
    });

    it('does not generate slug if base slug generation returns empty string', async () => {
      mockGenerateSlugFromCompanyName.mockReturnValue('');

      renderComponent({}, {
        companyName: '!!!',
        enterpriseSlug: '',
      });

      const blurTrigger = screen.getByTestId('blur-trigger');
      blurTrigger.click();

      await waitFor(() => {
        expect(mockGenerateSlugFromCompanyName).toHaveBeenCalled();
      });

      expect(mockFindAvailableSlug).not.toHaveBeenCalled();
    });

    it('handles whitespace-only company name', async () => {
      renderComponent({}, {
        companyName: '   ',
        enterpriseSlug: '',
      });

      const blurTrigger = screen.getByTestId('blur-trigger');
      blurTrigger.click();

      await waitFor(() => {
        expect(mockTrackFieldBlur).toHaveBeenCalled();
      });

      expect(mockGenerateSlugFromCompanyName).not.toHaveBeenCalled();
    });

    it('clears slug when company name is cleared', async () => {
      const mockForm = createMockForm({}, {
        companyName: '',
        enterpriseSlug: 'existing-slug',
      });

      render(
        <QueryClientProvider client={queryClient}>
          <AppContext.Provider value={{ authenticatedUser: mockAuthenticatedUser }}>
            <IntlProvider locale="en">
              <CompanyNameField form={mockForm as any} />
            </IntlProvider>
          </AppContext.Provider>
        </QueryClientProvider>,
      );

      const blurTrigger = screen.getByTestId('blur-trigger');
      blurTrigger.click();

      await waitFor(() => {
        expect(mockForm.setValue).toHaveBeenCalledWith(
          'enterpriseSlug',
          '',
          {
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true,
          },
        );
      });

      expect(mockGenerateSlugFromCompanyName).not.toHaveBeenCalled();
      expect(mockFindAvailableSlug).not.toHaveBeenCalled();
    });

    it('clears slug when company name is whitespace-only', async () => {
      const mockForm = createMockForm({}, {
        companyName: '   ',
        enterpriseSlug: 'existing-slug',
      });

      render(
        <QueryClientProvider client={queryClient}>
          <AppContext.Provider value={{ authenticatedUser: mockAuthenticatedUser }}>
            <IntlProvider locale="en">
              <CompanyNameField form={mockForm as any} />
            </IntlProvider>
          </AppContext.Provider>
        </QueryClientProvider>,
      );

      const blurTrigger = screen.getByTestId('blur-trigger');
      blurTrigger.click();

      await waitFor(() => {
        expect(mockForm.setValue).toHaveBeenCalledWith(
          'enterpriseSlug',
          '',
          expect.any(Object),
        );
      });

      expect(mockGenerateSlugFromCompanyName).not.toHaveBeenCalled();
      expect(mockFindAvailableSlug).not.toHaveBeenCalled();
    });
  });
});
