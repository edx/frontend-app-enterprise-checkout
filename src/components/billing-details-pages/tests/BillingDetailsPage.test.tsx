import { useCheckout } from '@stripe/react-stripe-js';
import { screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

import { useBFFSuccess, useCheckoutSessionClientSecret, usePolledCheckoutIntent } from '@/components/app/data';
import { CheckoutPageRoute, DataStoreKey } from '@/constants/checkout';
import EVENT_NAMES from '@/constants/events';
import { checkoutFormStore } from '@/hooks/useCheckoutFormStore';
import { renderStepperRoute } from '@/utils/tests';

// Mock the tracking utility
jest.mock('@/utils/common', () => ({
  ...jest.requireActual('@/utils/common'),
  sendEnterpriseCheckoutTrackingEvent: jest.fn(),
}));

// Mock the checkout intent hook
jest.mock('@/components/app/data', () => ({
  ...jest.requireActual('@/components/app/data'),
  useCheckoutIntent: jest.fn(),
  useCheckoutSessionClientSecret: jest.fn(),
  usePolledCheckoutIntent: jest.fn(),
  useBFFSuccess: jest.fn(),
}));

const { sendEnterpriseCheckoutTrackingEvent } = jest.requireMock('@/utils/common');
const { useCheckoutIntent } = jest.requireMock('@/components/app/data');

jest.mock('@stripe/react-stripe-js', () => ({
  ...jest.requireActual('@stripe/react-stripe-js'),
  CheckoutProvider: jest.fn().mockImplementation(({ children }) => <div>{children}</div>),
  AddressElement: jest.fn().mockImplementation(() => <div>AddressElement</div>),
  PaymentElement: jest.fn().mockImplementation(() => <div>PaymentElement</div>),
  useCheckout: jest.fn(),
}));

describe('BillingDetailsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useCheckoutIntent as jest.Mock).mockReturnValue({
      data: {
        id: 'test-checkout-intent-id',
        foo: 'bar',
      },
    });
    (useCheckoutSessionClientSecret as jest.Mock).mockReturnValue('secret-123');
    (useCheckout as jest.Mock).mockReturnValue({
      canConfirm: true,
      confirm: jest.fn().mockResolvedValue({ type: 'success' }),
      status: {
        type: 'open',
      },
    });
  });

  it('renders the title correctly', () => {
    renderStepperRoute(CheckoutPageRoute.BillingDetails, {
      config: {},
      authenticatedUser: {
        userId: 12345,
      },
    });
    expect(screen.getByTestId('stepper-title')).toHaveTextContent('Billing Details');
  });

  it('renders the purchase button correctly', async () => {
    renderStepperRoute(CheckoutPageRoute.BillingDetails, {
      config: {},
      authenticatedUser: {
        userId: 12345,
      },
    } as any);
    await waitFor(() => validateText('Subscribe'));
  });

  it('renders the TermsAndConditions component', () => {
    renderStepperRoute(CheckoutPageRoute.BillingDetails, {
      config: {},
      authenticatedUser: {
        userId: 12345,
      },
    } as any);
    validateText('edX Enterprise Terms');
    validateText('I have read and accepted', { exact: false });
    validateText('I confirm I am subscribing', { exact: false });
  });

  it('emits tracking event when subscribe button is clicked', async () => {
    const user = userEvent.setup();

    renderStepperRoute(CheckoutPageRoute.BillingDetails);

    // Fill out the required terms and conditions checkboxes
    const tncCheckbox = screen.getByLabelText(/I have read and accepted/i);
    const subscriptionCheckbox = screen.getByLabelText(/I confirm I am subscribing/i);

    await user.click(tncCheckbox);
    await user.click(subscriptionCheckbox);

    const subscribeButton = screen.getByRole('button', { name: 'Subscribe' });
    await user.click(subscribeButton);

    expect(sendEnterpriseCheckoutTrackingEvent).toHaveBeenCalledWith({
      checkoutIntentId: 'test-checkout-intent-id',
      eventName: EVENT_NAMES.SUBSCRIPTION_CHECKOUT.BILLING_DETAILS_SUBSCRIBE_BUTTON_CLICKED,
    });
  });
});

describe('BillingDetailsSuccessPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useCheckout as jest.Mock).mockReturnValue({
      canConfirm: true,
      confirm: jest.fn(),
      status: {
        type: 'complete',
        paymentStatus: 'paid',
      },
    });
    (usePolledCheckoutIntent as jest.Mock).mockReturnValue({
      data: {
        id: 1,
      },
    });
    (useBFFSuccess as jest.Mock).mockReturnValue({
      data: {
        checkoutIntent: {
          state: 'paid',
        },
      },
      refetch: jest.fn(),
    });
  });

  it('renders the title correctly based on form state (first name from Plan Details)', () => {
    // Seed the form store with a full name as entered/derived in Plan Details
    checkoutFormStore.setState((s) => ({
      ...s,
      formData: {
        ...s.formData,
        [DataStoreKey.PlanDetails]: {
          ...s.formData[DataStoreKey.PlanDetails],
          fullName: 'Alice Example',
        },
      },
    }));

    renderStepperRoute(CheckoutPageRoute.BillingDetailsSuccess, {
      config: {},
      authenticatedUser: {
        userId: 12345,
      },
    });

    // The Billing Details Success title uses the "firstName" param populated from the form state.
    // The component currently passes fullName to the "firstName" placeholder.
    expect(screen.getByTestId('stepper-title')).toHaveTextContent('Thank you, Alice Example.');
  });

  it('renders the OrderDetails component', () => {
    renderStepperRoute(CheckoutPageRoute.BillingDetailsSuccess, {
      config: {},
      authenticatedUser: {
        userId: 12345,
      },
    });
    validateText('Order Details');
    validateText('You have purchased an edX team\'s subscription.');
  });

  it('renders the SuccessHeading component', async () => {
    renderStepperRoute(CheckoutPageRoute.BillingDetailsSuccess, {
      config: {},
      authenticatedUser: {
        userId: 12345,
      },
    });
    await waitFor(() => validateText((content) => content.includes('Welcome to edX for Teams!')));
    expect(screen.getByAltText('Celebration of subscription purchase success')).toBeInTheDocument();
  });
});
