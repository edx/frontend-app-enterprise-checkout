import { IntlProvider } from '@edx/frontend-platform/i18n';
import { logError } from '@edx/frontend-platform/logging';
import { AppContext } from '@edx/frontend-platform/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

import fetchCheckoutValidation from '@/components/app/data/services/validation';
import { CheckoutStepKey } from '@/constants/checkout';
import { useCheckoutFormStore } from '@/hooks/useCheckoutFormStore';
import { trackFieldBlur } from '@/hooks/useFieldTracking';
import { findAvailableSlug, generateSlugFromCompanyName } from '@/utils/checkout';

import CompanyNameField from '../CompanyNameField';

let enterPreventDefaultMock: jest.Mock | null = null;
let enterBlurMock: jest.Mock | null = null;

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
  watch: jest.fn((fieldName: string) => {
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

jest.mock('@/components/app/data/services/validation', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@edx/frontend-platform/logging', () => ({
  logError: jest.fn(),
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
const mockFetchCheckoutValidation = fetchCheckoutValidation as jest.Mock;
const mockLogError = logError as jest.Mock;

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
  default: ({
    floatingLabel,
    placeholder,
    form,
    name,
    onBlur,
    onKeyDown,
    disabled,
  }) => {
    const error = form?.formState?.errors[name];
    return (
      <div data-testid="field-mock">
        <div data-testid="floating-label">{floatingLabel}</div>
        <div data-testid="placeholder">{placeholder}</div>
        <div data-testid="disabled-state">{String(Boolean(disabled))}</div>
        {error && <div data-testid="error-message">{error.message}</div>}
        <button type="button" onClick={onBlur} data-testid="blur-trigger">Trigger Blur</button>
        <button
          type="button"
          onClick={() => {
            enterPreventDefaultMock = jest.fn();
            enterBlurMock = jest.fn();
            onKeyDown?.({
              key: 'Enter',
              preventDefault: enterPreventDefaultMock,
              currentTarget: { blur: enterBlurMock },
            });
          }}
          data-testid="enter-trigger"
        >
          Trigger Enter
        </button>
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
    enterPreventDefaultMock = null;
    enterBlurMock = null;
    mockUseCheckoutFormStore.mockImplementation((selector: any) => selector({
      formData: {
        PlanDetails: {
          adminEmail: 'admin@example.com',
        },
      },
    }));
    mockFetchCheckoutValidation.mockResolvedValue({
      validationDecisions: {},
    });
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

  it('triggers input blur on Enter keydown', () => {
    renderComponent();
    screen.getByTestId('enter-trigger').click();

    expect(enterPreventDefaultMock).toHaveBeenCalledTimes(1);
    expect(enterBlurMock).toHaveBeenCalledTimes(1);
  });

  it('clears the slug when company name becomes empty via watch only after field is touched', async () => {
    const form = createMockForm({ companyName: '', enterpriseSlug: 'acme-corp' }) as any;
    form.formState = {
      ...form.formState,
      touchedFields: { companyName: true },
    };

    render(
      <QueryClientProvider client={queryClient}>
        <AppContext.Provider value={{ authenticatedUser: mockAuthenticatedUser }}>
          <IntlProvider locale="en">
            <CompanyNameField form={form} />
          </IntlProvider>
        </AppContext.Provider>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(form.setValue).toHaveBeenCalledWith('enterpriseSlug', '', {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });
    });
  });

  it('does not clear the slug on initial load when company name is empty and field is not touched', () => {
    const form = createMockForm({ companyName: '', enterpriseSlug: 'acme-corp' }) as any;
    form.formState = {
      ...form.formState,
      touchedFields: {}, // Field not touched on initial load
    };

    render(
      <QueryClientProvider client={queryClient}>
        <AppContext.Provider value={{ authenticatedUser: mockAuthenticatedUser }}>
          <IntlProvider locale="en">
            <CompanyNameField form={form} />
          </IntlProvider>
        </AppContext.Provider>
      </QueryClientProvider>,
    );

    // setValue should not have been called to clear the slug
    expect(form.setValue).not.toHaveBeenCalledWith('enterpriseSlug', '', expect.anything());
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

    await waitFor(() => {
      expect(mockFetchCheckoutValidation).toHaveBeenCalledWith({
        enterprise_slug: 'acme-corp',
        admin_email: 'admin@example.com',
      });
      expect(form.setValue).toHaveBeenCalledWith('enterpriseSlug', 'acme-corp', {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });
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
    await waitFor(() => {
      expect(form.setValue).toHaveBeenCalledWith('enterpriseSlug', '', {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });
    });
    expect(mockFetchCheckoutValidation).not.toHaveBeenCalled();
  });

  it('regenerates a slug when company name changes even if enterpriseSlug already has a value', async () => {
    const form = createMockForm({ companyName: 'Acme Corp Updated', enterpriseSlug: 'acme-corp' }) as any;

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
    await waitFor(() => {
      expect(mockTrackFieldBlur).toHaveBeenCalled();
    });

    expect(mockFetchCheckoutValidation).toHaveBeenCalledWith({
      enterprise_slug: 'acme-corp-updated',
      admin_email: 'admin@example.com',
    });
    expect(form.setValue).toHaveBeenCalledWith('enterpriseSlug', 'acme-corp-updated', {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
  });

  it('does not call availability check when generated base slug is empty', async () => {
    const form = createMockForm({ companyName: '!!!', enterpriseSlug: '' }) as any;

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
    await waitFor(() => {
      expect(mockTrackFieldBlur).toHaveBeenCalled();
    });

    expect(mockFetchCheckoutValidation).not.toHaveBeenCalled();
    expect(form.setValue).not.toHaveBeenCalledWith('enterpriseSlug', expect.anything(), expect.anything());
  });

  it('passes undefined adminEmail to availability check when plan details email is unavailable', async () => {
    mockUseCheckoutFormStore.mockImplementation((selector: any) => selector({
      formData: {
        PlanDetails: {},
      },
    }));

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
    await waitFor(() => {
      expect(mockFetchCheckoutValidation).toHaveBeenCalledWith({
        enterprise_slug: 'acme-corp',
        admin_email: '',
      });
    });
  });

  it('retries with numeric suffixes for taken and reserved slugs', async () => {
    mockFetchCheckoutValidation
      .mockResolvedValueOnce({
        validationDecisions: {
          enterpriseSlug: { errorCode: 'existing_enterprise_customer' },
        },
      })
      .mockResolvedValueOnce({
        validationDecisions: {
          enterpriseSlug: { errorCode: 'slug_reserved' },
        },
      })
      .mockResolvedValueOnce({
        validationDecisions: {},
      });

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
    await waitFor(() => {
      expect(mockFetchCheckoutValidation).toHaveBeenNthCalledWith(
        1,
        {
          enterprise_slug: 'acme-corp',
          admin_email: 'admin@example.com',
        },
      );
      expect(mockFetchCheckoutValidation).toHaveBeenNthCalledWith(
        2,
        {
          enterprise_slug: 'acme-corp-1',
          admin_email: 'admin@example.com',
        },
      );
      expect(mockFetchCheckoutValidation).toHaveBeenNthCalledWith(
        3,
        {
          enterprise_slug: 'acme-corp-2',
          admin_email: 'admin@example.com',
        },
      );
      expect(form.setValue).toHaveBeenCalledWith('enterpriseSlug', 'acme-corp-2', {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });
    });
  });

  it('logs and returns the generated slug for non-retryable validation errors', async () => {
    mockFetchCheckoutValidation.mockResolvedValue({
      validationDecisions: {
        enterpriseSlug: { errorCode: 'invalid_format' },
      },
    });

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
    await waitFor(() => {
      expect(mockLogError).toHaveBeenCalledWith(
        'Slug validation returned a non-retryable error for acme-corp: invalid_format',
      );
      expect(form.setValue).toHaveBeenCalledWith('enterpriseSlug', 'acme-corp', {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });
    });
  });

  it('logs and returns the generated slug when validation throws', async () => {
    mockFetchCheckoutValidation.mockRejectedValue(new Error('network'));

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
    await waitFor(() => {
      expect(mockLogError).toHaveBeenCalledWith(
        'Slug validation failed for acme-corp',
        expect.any(Error),
      );
      expect(form.setValue).toHaveBeenCalledWith('enterpriseSlug', 'acme-corp', {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });
    });
  });
});

describe('checkout slug helpers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetchCheckoutValidation.mockReset();
    mockLogError.mockReset();
  });

  it('returns an empty slug for invalid company names', () => {
    expect(generateSlugFromCompanyName('')).toBe('');
    expect(generateSlugFromCompanyName(null as unknown as string)).toBe('');
  });

  it('returns the base slug immediately when no slug is provided', async () => {
    await expect(findAvailableSlug('')).resolves.toBe('');
    expect(mockFetchCheckoutValidation).not.toHaveBeenCalled();
  });

  it('returns the candidate when validation has no enterpriseSlug decision', async () => {
    mockFetchCheckoutValidation.mockResolvedValue({
      validationDecisions: {},
    });

    await expect(findAvailableSlug('acme-corp', 'admin@example.com')).resolves.toBe('acme-corp');

    expect(mockFetchCheckoutValidation).toHaveBeenCalledWith({
      enterprise_slug: 'acme-corp',
      admin_email: 'admin@example.com',
    });
    expect(mockLogError).not.toHaveBeenCalled();
  });

  it('truncates long base slugs when retrying with numeric suffixes', async () => {
    mockFetchCheckoutValidation
      .mockResolvedValueOnce({
        validationDecisions: {
          enterpriseSlug: { errorCode: 'existing_enterprise_customer' },
        },
      })
      .mockResolvedValueOnce({
        validationDecisions: {},
      });

    await expect(findAvailableSlug('abcdefghijklmnopqrstuvwxyzabcd', 'admin@example.com')).resolves.toBe('abcdefghijklmnopqrstuvwxyzab-1');

    expect(mockFetchCheckoutValidation).toHaveBeenNthCalledWith(
      1,
      {
        enterprise_slug: 'abcdefghijklmnopqrstuvwxyzabcd',
        admin_email: 'admin@example.com',
      },
    );
    expect(mockFetchCheckoutValidation).toHaveBeenNthCalledWith(
      2,
      {
        enterprise_slug: 'abcdefghijklmnopqrstuvwxyzab-1',
        admin_email: 'admin@example.com',
      },
    );
  });

  it('logs and returns the last candidate when slug generation exceeds max attempts', async () => {
    mockFetchCheckoutValidation.mockResolvedValue({
      validationDecisions: {
        enterpriseSlug: { errorCode: 'existing_enterprise_customer' },
      },
    });

    await expect(findAvailableSlug('acme-corp', 'admin@example.com')).resolves.toBe('acme-corp-19');

    expect(mockFetchCheckoutValidation).toHaveBeenCalledTimes(20);
    expect(mockFetchCheckoutValidation).toHaveBeenLastCalledWith({
      enterprise_slug: 'acme-corp-19',
      admin_email: 'admin@example.com',
    });
    expect(mockLogError).toHaveBeenCalledWith(
      'Slug generation exceeded max attempts for base slug acme-corp',
    );
  });
});
