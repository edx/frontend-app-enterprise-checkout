import { IntlProvider } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { CheckoutStepKey } from '@/constants/checkout';
import CustomUrlField from '../CustomUrlField';

const mockForm = {
  formState: {
    errors: {},
    touchedFields: {},
  },
  register: jest.fn().mockReturnValue({}),
  watch: jest.fn(() => 'test-slug'),
};

// Mock debounce tracking function
const mockTrackDebouncedFieldBlur = jest.fn();
jest.mock('@/hooks/useDebounceTrackFieldBlur', () => ({
  trackDebouncedFieldBlur: (args) => mockTrackDebouncedFieldBlur(args),
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

describe('CustomUrlField', () => {
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
          <CustomUrlField form={mockForm as any} />
        </IntlProvider>
      </AppContext.Provider>
    </QueryClientProvider>,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the title correctly', () => {
    renderComponent();
    validateText('Create a custom URL for your team');
  });

  it('renders the description correctly', () => {
    renderComponent();
    validateText((content) => content.includes('This is how your colleagues will access your team subscription on edX'));
    validateText((content) => content.includes('This access link name cannot be changed after your trial subscription starts'));
  });

  it('should call debounce tracking function on blur', () => {
    renderComponent();
    const blurTrigger = screen.getByTestId('blur-trigger');
    blurTrigger.click();
    expect(mockTrackDebouncedFieldBlur).toHaveBeenCalledTimes(1);
    expect(mockTrackDebouncedFieldBlur).toHaveBeenCalledWith(expect.objectContaining({
      fieldName: 'urlSlug',
      step: CheckoutStepKey.AccountDetails,
    }));
  });
});
