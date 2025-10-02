import { AppContext } from '@edx/frontend-platform/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { useBFFSuccess, usePolledCheckoutIntent, useFirstBillableInvoice } from '@/components/app/data';
import { BillingDetailsSuccessContent } from '@/components/Stepper/StepperContent';

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

  const renderComponent = (appContextValue = mockAppContextValue) =>
    render(
      <IntlProvider locale="en">
        <AppContext.Provider value={appContextValue}>
          <BillingDetailsSuccessContent />
        </AppContext.Provider>
      </IntlProvider>,
    );

  beforeEach(() => {
    jest.clearAllMocks();

    // Set default mock values for all hooks
    mockUseBFFSuccess.mockReturnValue({ data: null });
    mockUsePolledCheckoutIntent.mockReturnValue({ data: null });
    mockUseFirstBillableInvoice.mockReturnValue({ data: null });
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
    mockUseBFFSuccess.mockReturnValue({
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
    mockUseBFFSuccess.mockReturnValue({
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
    mockUseBFFSuccess.mockReturnValue({
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
    mockUseBFFSuccess.mockReturnValue({
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
    mockUseBFFSuccess.mockReturnValue({
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
    mockUseBFFSuccess.mockReturnValue({
      data: { checkoutIntent: null },
    });

    renderComponent();

    expect(screen.queryByText(/Welcome to edX for Teams!/)).not.toBeInTheDocument();
    expect(screen.queryByText('We\'re sorry, something went wrong')).not.toBeInTheDocument();
    validateText('Creating your account');
  });
});
