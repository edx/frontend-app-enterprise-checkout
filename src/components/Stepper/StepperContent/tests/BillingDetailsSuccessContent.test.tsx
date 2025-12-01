import { IntlProvider } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import {
  useBFFSuccess, useCheckoutIntent,
  useCreateBillingPortalSession,
  useFirstBillableInvoice,
  usePolledAuthenticatedUser,
  usePolledCheckoutIntent,
  usePurchaseSummaryPricing,
} from '@/components/app/data';
import { BillingDetailsSuccessContent } from '@/components/Stepper/StepperContent';
import { queryClient } from '@/utils/tests';

// Mock only the hooks used by child components
jest.mock('@/components/app/data', () => ({
  useBFFSuccess: jest.fn(),
  usePolledAuthenticatedUser: jest.fn(),
  usePolledCheckoutIntent: jest.fn(),
  useFirstBillableInvoice: jest.fn(),
  useCreateBillingPortalSession: jest.fn(),
  useCheckoutIntent: jest.fn(),
  usePurchaseSummaryPricing: jest.fn(),
}));

const mockUseBFFSuccess = useBFFSuccess as jest.MockedFunction<typeof useBFFSuccess>;
const mockUsePolledAuthenticatedUser = (
  usePolledAuthenticatedUser as jest.MockedFunction<typeof usePolledAuthenticatedUser>
);
const mockUsePolledCheckoutIntent = usePolledCheckoutIntent as jest.MockedFunction<typeof usePolledCheckoutIntent>;
const mockUseFirstBillableInvoice = useFirstBillableInvoice as jest.MockedFunction<typeof useFirstBillableInvoice>;
const mockCreateBillingPortalSession = useCreateBillingPortalSession as
  jest.MockedFunction<typeof useCreateBillingPortalSession>;
const mockUseCheckoutIntent = useCheckoutIntent as jest.MockedFunction<typeof useCheckoutIntent>;

describe('BillingDetailsSuccessContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (usePurchaseSummaryPricing as jest.Mock).mockReturnValue({
      yearlySubscriptionCostForQuantity: 150,
    });
  });

  const mockAuthenticatedUser = {
    id: 12345,
    userId: 12345,
    username: 'testuser',
    email: 'test@example.com',
    name: 'Test User',
    isActive: true,
  };

  const mockAppContextValue = {
    authenticatedUser: mockAuthenticatedUser,
    config: {},
  };

  const renderComponent = (appContextValue = mockAppContextValue) => render(
    <QueryClientProvider client={queryClient()}>
      <IntlProvider locale="en">
        <AppContext.Provider value={appContextValue}>
          <BillingDetailsSuccessContent />
        </AppContext.Provider>
      </IntlProvider>
    </QueryClientProvider>,
  );

  beforeEach(() => {
    jest.clearAllMocks();

    // Set default mock values for all hooks
    (mockUseBFFSuccess as jest.Mock).mockReturnValue({
      data: null,
      refetch: jest.fn().mockImplementation(() => ({ catch: jest.fn() })),
    });
    (mockUsePolledCheckoutIntent as jest.Mock).mockReturnValue({ polledCheckoutIntent: null });
    (mockUsePolledAuthenticatedUser as jest.Mock).mockReturnValue({
      polledAuthenticatedUser: { isActive: true },
    });
    (mockUseFirstBillableInvoice as jest.Mock).mockReturnValue({
      data: {
        last4: '4242',
        cardBrand: 'visa',
        hasCardDetails: true,
        hasBillingAddress: false,
      },
      refetch: jest.fn(),
      isLoading: false,
    });
    (mockCreateBillingPortalSession as jest.Mock).mockReturnValue({
      data: {
        url: 'https://billing-portal.example.com/session',
      },
    });
    (mockUseCheckoutIntent as jest.Mock).mockReturnValue({
      data: {
        id: 7,
        uuid: 'checkout-intent-uuid',
      },
    });
  });

  it('renders BillingDetailsHeadingMessage, StatefulProvisioningButton and OrderDetails by default', () => {
    renderComponent();

    // BillingDetailsHeadingMessage renders with celebration image
    expect(screen.getByAltText('Celebration of subscription purchase success')).toBeInTheDocument();
    // OrderDetails renders its content
    validateText('Order details');
    validateText('You have purchased an edX team\'s subscription.');
  });

  it('renders PendingHeading when checkout intent state is "paid"', () => {
    (mockUseBFFSuccess as jest.Mock).mockReturnValue({
      data: {
        checkoutIntent: { state: 'paid' },
      },
      refetch: jest.fn().mockImplementation(() => ({ catch: jest.fn() })),
    });
    (mockUsePolledCheckoutIntent as jest.Mock).mockReturnValue({
      polledCheckoutIntent: {
        state: 'paid',
      },
    });

    renderComponent();

    validateText(/Welcome to edX for Teams! Your account is currently being configured/);
    expect(screen.getByAltText('Celebration of subscription purchase success')).toBeInTheDocument();
    expect(screen.queryByText('We\'re sorry, something went wrong')).not.toBeInTheDocument();
  });

  it('renders SuccessHeading when checkout intent state is "fulfilled"', () => {
    (mockUseBFFSuccess as jest.Mock).mockReturnValue({
      data: {
        checkoutIntent: { state: 'fulfilled' },
      },
      refetch: jest.fn().mockImplementation(() => ({ catch: jest.fn() })),
    });
    (mockUsePolledCheckoutIntent as jest.Mock).mockReturnValue({
      polledCheckoutIntent: {
        state: 'fulfilled',
      },
    });

    renderComponent();

    validateText(/Welcome to edX for Teams!/);
    expect(screen.getByAltText('Celebration of subscription purchase success')).toBeInTheDocument();
    expect(screen.queryByText('We\'re sorry, something went wrong')).not.toBeInTheDocument();
  });

  it.each([
    'errored_provisioning',
    'errored_fulfillment_stalled',
    'errored_backoffice',
  ])('renders ErrorHeading when checkout intent state is (%s)', (
    state: CheckoutIntentState,
  ) => {
    (mockUseBFFSuccess as jest.Mock).mockReturnValue({
      data: {
        checkoutIntent: { state },
      },
      refetch: jest.fn().mockImplementation(() => ({ catch: jest.fn() })),
    });
    (mockUsePolledCheckoutIntent as jest.Mock).mockReturnValue({
      polledCheckoutIntent: { state },
    });

    renderComponent();

    validateText('Account Setup is Taking Longer Than Expected');
    validateText("We're experiencing a brief delay in setting up your edX Teams account. We'll send you a confirmation email immediately once your account is fully operational. Thank you for your patience!");
    expect(screen.queryByText(/Welcome to edX for Teams!/)).not.toBeInTheDocument();
  });
});
