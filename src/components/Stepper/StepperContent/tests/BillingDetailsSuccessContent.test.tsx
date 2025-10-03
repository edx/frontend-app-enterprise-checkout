import { IntlProvider } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { useBFFSuccess, useFirstBillableInvoice, usePolledCheckoutIntent } from '@/components/app/data';
import { BillingDetailsSuccessContent } from '@/components/Stepper/StepperContent';
import { queryClient } from '@/utils/tests';

// Mock only the hooks used by child components
jest.mock('@/components/app/data', () => ({
  useBFFSuccess: jest.fn(),
  usePolledCheckoutIntent: jest.fn(),
  useFirstBillableInvoice: jest.fn(),
}));

const mockUseBFFSuccess = useBFFSuccess as jest.MockedFunction<typeof useBFFSuccess>;
const mockUsePolledCheckoutIntent = usePolledCheckoutIntent as jest.MockedFunction<typeof usePolledCheckoutIntent>;
const mockUseFirstBillableInvoice = useFirstBillableInvoice as jest.MockedFunction<typeof useFirstBillableInvoice>;

describe('BillingDetailsSuccessContent', () => {
  const mockAuthenticatedUser = {
    id: 12345,
    userId: 12345,
    username: 'testuser',
    email: 'test@example.com',
    name: 'Test User',
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
    (mockUseBFFSuccess as jest.Mock).mockReturnValue({ data: null });
    (mockUsePolledCheckoutIntent as jest.Mock).mockReturnValue({ data: null });
    (mockUseFirstBillableInvoice as jest.Mock).mockReturnValue({ data: null });
  });

  it('renders StatefulProvisioningButton and OrderDetails by default', () => {
    renderComponent();

    // StatefulProvisioningButton renders with pending state by default
    validateText('Creating your account');
    // OrderDetails renders its content
    validateText('Order Details');
    validateText('You have purchased an edX team\'s subscription.');
  });

  it('renders SuccessHeading when checkout intent state is "paid"', () => {
    (mockUseBFFSuccess as jest.Mock).mockReturnValue({
      data: {
        checkoutIntent: { state: 'paid' },
      },
    });

    renderComponent();

    validateText(/Welcome to edX for Teams!/);
    expect(screen.getByAltText('Celebration of subscription purchase success')).toBeInTheDocument();
    expect(screen.queryByText('We\'re sorry, something went wrong')).not.toBeInTheDocument();
  });

  it('renders SuccessHeading when checkout intent state is "fulfilled"', () => {
    (mockUseBFFSuccess as jest.Mock).mockReturnValue({
      data: {
        checkoutIntent: { state: 'fulfilled' },
      },
    });

    renderComponent();

    validateText(/Welcome to edX for Teams!/);
    expect(screen.getByAltText('Celebration of subscription purchase success')).toBeInTheDocument();
    expect(screen.queryByText('We\'re sorry, something went wrong')).not.toBeInTheDocument();
  });

  it('renders ErrorHeading when checkout intent state is "errored_provisioning"', () => {
    (mockUseBFFSuccess as jest.Mock).mockReturnValue({
      data: {
        checkoutIntent: { state: 'errored_provisioning' },
      },
    });

    renderComponent();

    validateText('We\'re sorry, something went wrong');
    validateText('contact our support team');
    expect(screen.queryByText(/Welcome to edX for Teams!/)).not.toBeInTheDocument();
  });

  it('renders ErrorHeading when checkout intent state is "errored_stripe_checkout"', () => {
    (mockUseBFFSuccess as jest.Mock).mockReturnValue({
      data: {
        checkoutIntent: { state: 'errored_stripe_checkout' },
      },
    });

    renderComponent();

    validateText('We\'re sorry, something went wrong');
    validateText('contact our support team');
    expect(screen.queryByText(/Welcome to edX for Teams!/)).not.toBeInTheDocument();
  });

  it('does not render SuccessHeading or ErrorHeading for other states', () => {
    (mockUseBFFSuccess as jest.Mock).mockReturnValue({
      data: {
        checkoutIntent: { state: 'processing' },
      },
    });

    renderComponent();

    expect(screen.queryByText(/Welcome to edX for Teams!/)).not.toBeInTheDocument();
    expect(screen.queryByText('We\'re sorry, something went wrong')).not.toBeInTheDocument();
  });

  it('calls useBFFSuccess with authenticated user id', () => {
    renderComponent();

    expect(mockUseBFFSuccess).toHaveBeenCalledWith(mockAuthenticatedUser.id);
  });

  it('handles null authenticated user', () => {
    const appContextWithoutUser = {
      authenticatedUser: null,
      config: {},
    };

    // @ts-ignore
    renderComponent(appContextWithoutUser);

    expect(mockUseBFFSuccess).toHaveBeenCalledWith(undefined);
    validateText('Creating your account');
  });

  it('handles null success BFF context data', () => {
    renderComponent();

    expect(screen.queryByText(/Welcome to edX for Teams!/)).not.toBeInTheDocument();
    expect(screen.queryByText('We\'re sorry, something went wrong')).not.toBeInTheDocument();
    validateText('Creating your account');
  });

  it('handles null checkout intent', () => {
    (mockUseBFFSuccess as jest.Mock).mockReturnValue({
      data: { checkoutIntent: null },
    });

    renderComponent();

    expect(screen.queryByText(/Welcome to edX for Teams!/)).not.toBeInTheDocument();
    expect(screen.queryByText('We\'re sorry, something went wrong')).not.toBeInTheDocument();
    validateText('Creating your account');
  });
});
