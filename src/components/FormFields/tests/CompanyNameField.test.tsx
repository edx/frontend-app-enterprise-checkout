import { IntlProvider } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import CompanyNameField from '../CompanyNameField';

// Mock the form object
const createMockForm = (errors = {}) => ({
  formState: {
    errors,
    touchedFields: { companyName: true },
  },
  register: jest.fn().mockReturnValue({}),
});

// Mock tracking hook
const mockHandleBlur = jest.fn();
jest.mock('@/hooks/useFieldTracking', () => ({
  useFieldTracking: jest.fn(() => mockHandleBlur),
}));

// Mock BFF context hook
jest.mock('@/components/app/data/hooks/useBFFContext', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    data: {
      checkoutIntent: { id: 123 },
    },
  })),
}));

jest.mock('@/components/FormFields/Field', () => ({
  __esModule: true,
  default: ({ floatingLabel, placeholder, form, name, onBlur }) => {
    const error = form?.formState?.errors[name];
    return (
      <div data-testid="field-mock">
        <div data-testid="floating-label">{floatingLabel}</div>
        <div data-testid="placeholder">{placeholder}</div>
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

  const renderComponent = (errors = {}) => render(
    <QueryClientProvider client={queryClient}>
      <AppContext.Provider value={{ authenticatedUser: mockAuthenticatedUser }}>
        <IntlProvider locale="en">
          <CompanyNameField form={createMockForm(errors) as any} />
        </IntlProvider>
      </AppContext.Provider>
    </QueryClientProvider>,
  );

  beforeEach(() => {
    jest.clearAllMocks();
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
      companyName: {
        type: 'required',
        message: 'Company name is required',
      },
    });
    expect(screen.getByTestId('error-message')).toHaveTextContent('Company name is required');
  });

  it('should call tracking handler on blur', () => {
    renderComponent();
    const blurTrigger = screen.getByTestId('blur-trigger');
    blurTrigger.click();
    expect(mockHandleBlur).toHaveBeenCalledTimes(1);
  });
});
