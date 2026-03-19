import { IntlProvider } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import LicensesField from '../LicensesField';

// Mock the form object
const mockForm = {
  formState: {
    errors: {},
    touchedFields: {},
  },
  register: jest.fn().mockReturnValue({}),
};

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
    expect(mockHandleBlur).toHaveBeenCalledTimes(1);
  });
});
