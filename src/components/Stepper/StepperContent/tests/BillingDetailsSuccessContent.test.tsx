import { IntlProvider } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import {
  useBFFSuccess, useCheckoutIntent,
  useFirstBillableInvoice,
  usePolledAuthenticatedUser,
  usePolledCheckoutIntent,
  usePurchaseSummaryPricing,
} from '@/components/app/data';
import { BillingDetailsSuccessContent } from '@/components/Stepper/StepperContent';
import EVENT_NAMES, { CHECKOUT_EVENT_STEPS } from '@/constants/events';
import { claimBillingStepCompleted, markCheckoutPaymentSubmitted, sendCheckoutEvent } from '@/utils/checkoutEvents';
import { queryClient } from '@/utils/tests';

const mockProduct = { category: 'subscription', name: 'teams', brand: 'enterprise' };

// Mock only the hooks used by child components
jest.mock('@/components/app/data', () => ({
  useBFFSuccess: jest.fn(),
  usePolledAuthenticatedUser: jest.fn(),
  usePolledCheckoutIntent: jest.fn(),
  useFirstBillableInvoice: jest.fn(),
  useCheckoutIntent: jest.fn(),
  usePurchaseSummaryPricing: jest.fn(),
  useCheckoutEventProductProperties: jest.fn(() => mockProduct),
}));

jest.mock('@/utils/checkoutEvents', () => ({
  ...jest.requireActual('@/utils/checkoutEvents'),
  sendCheckoutEvent: jest.fn(),
}));

const mockUseBFFSuccess = useBFFSuccess as jest.MockedFunction<typeof useBFFSuccess>;
const mockUsePolledAuthenticatedUser = (
  usePolledAuthenticatedUser as jest.MockedFunction<typeof usePolledAuthenticatedUser>
);
const mockUsePolledCheckoutIntent = usePolledCheckoutIntent as jest.MockedFunction<typeof usePolledCheckoutIntent>;
const mockUseFirstBillableInvoice = useFirstBillableInvoice as jest.MockedFunction<typeof useFirstBillableInvoice>;
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
    // Reset sessionStorage between tests
    sessionStorage.clear();

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
    (mockUseCheckoutIntent as jest.Mock).mockReturnValue({
      data: {
        id: 7,
        uuid: 'checkout-intent-uuid',
        adminPortalUrl: 'https://portal.stage.edx.org/test-enterprise-customer',
      },
    });
  });

  it('renders BillingDetailsHeadingMessage, StatefulProvisioningButton and OrderDetails by default', () => {
    // Set session to Teams flow (not Essentials)
    sessionStorage.removeItem('isEssentials');
    renderComponent();

    // BillingDetailsHeadingMessage renders with celebration image
    expect(screen.getByAltText('Celebration of subscription purchase success')).toBeInTheDocument();
    // OrderDetails renders its content
    validateText('Order details');
    validateText('You have purchased an edX Team subscription.');
  });

  it('renders Essentials-specific content when isEssentials is set', () => {
    // Set session to Essentials flow
    sessionStorage.setItem('isEssentials', 'true');
    renderComponent();

    // BillingDetailsHeadingMessage renders with celebration image
    expect(screen.getByAltText('Celebration of subscription purchase success')).toBeInTheDocument();
    // OrderDetails renders Essentials-specific content
    validateText('Order details');
    validateText('You have purchased an edX Essentials subscription.');
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

    validateText(/Welcome to edX for Team! Your account is currently being configured/);
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

    validateText(/Welcome to edX for Team/);
    expect(screen.getByAltText('Celebration of subscription purchase success')).toBeInTheDocument();
    expect(screen.queryByText(/Welcome to edX for Teams!/)).not.toBeInTheDocument();
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
    validateText("We're experiencing a brief delay in setting up your edX Team account. We'll send you a confirmation email immediately once your account is fully operational. Thank you for your patience!");
    expect(screen.queryByText(/Welcome to edX for Team/)).not.toBeInTheDocument();
  });

  describe('checkout_step_completed.billing_details after a Stripe redirect', () => {
    const paidCheckoutIntent = {
      uuid: 'checkout-intent-uuid',
      state: 'paid',
      quantity: 5,
      stripeCheckoutSessionId: 'cs_test_123',
    };

    beforeEach(() => {
      (mockUseBFFSuccess as jest.Mock).mockReturnValue({
        data: { checkoutIntent: paidCheckoutIntent },
        refetch: jest.fn().mockImplementation(() => ({ catch: jest.fn() })),
      });
      (mockUsePolledCheckoutIntent as jest.Mock).mockReturnValue({ polledCheckoutIntent: { state: 'paid' } });
    });

    it('emits the event once for a payment submitted in this tab', () => {
      markCheckoutPaymentSubmitted('checkout-intent-uuid');
      const { unmount } = renderComponent();
      unmount();
      renderComponent();

      expect(sendCheckoutEvent).toHaveBeenCalledTimes(1);
      expect(sendCheckoutEvent).toHaveBeenCalledWith({
        eventName: EVENT_NAMES.CHECKOUT.STEP_COMPLETED_BILLING_DETAILS,
        product: mockProduct,
        step: CHECKOUT_EVENT_STEPS.BILLING_DETAILS,
        order: { order_id: 'cs_test_123', total_quantity: 5 },
      });
    });

    it('does not emit when the billing page already emitted it', () => {
      markCheckoutPaymentSubmitted('checkout-intent-uuid');
      claimBillingStepCompleted('checkout-intent-uuid');
      renderComponent();
      expect(sendCheckoutEvent).not.toHaveBeenCalled();
    });

    it('does not emit for a revisit without a payment submitted in this tab', () => {
      renderComponent();
      expect(sendCheckoutEvent).not.toHaveBeenCalled();
    });

    it('does not emit before the checkout intent is paid', () => {
      markCheckoutPaymentSubmitted('checkout-intent-uuid');
      (mockUseBFFSuccess as jest.Mock).mockReturnValue({
        data: { checkoutIntent: { ...paidCheckoutIntent, state: 'created' } },
        refetch: jest.fn().mockImplementation(() => ({ catch: jest.fn() })),
      });
      renderComponent();
      expect(sendCheckoutEvent).not.toHaveBeenCalled();
    });
  });
});
