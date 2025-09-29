import { useCheckout } from '@stripe/react-stripe-js';
import { screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

import { useCheckoutSessionClientSecret } from '@/components/app/data';
import { CheckoutPageRoute, DataStoreKey } from '@/constants/checkout';
import { checkoutFormStore } from '@/hooks/useCheckoutFormStore';
import { renderStepperRoute } from '@/utils/tests';

jest.mock('@/components/app/data', () => ({
  ...jest.requireActual('@/components/app/data'),
  useCheckoutSessionClientSecret: jest.fn(),
}));

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
    (useCheckoutSessionClientSecret as jest.Mock).mockReturnValue('secret-123');
    (useCheckout as jest.Mock).mockReturnValue({
      canConfirm: true,
      confirm: jest.fn(),
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
});

describe('BillingDetailsSuccessPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useCheckoutSessionClientSecret as jest.Mock).mockReturnValue('secret-123');
    (useCheckout as jest.Mock).mockReturnValue({
      canConfirm: true,
      confirm: jest.fn(),
      status: {
        type: 'complete',
        paymentStatus: 'paid',
      },
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

  it('renders the SuccessHeading component', () => {
    renderStepperRoute(CheckoutPageRoute.BillingDetailsSuccess, {
      config: {},
      authenticatedUser: {
        userId: 12345,
      },
    });
    validateText((content) => content.includes('Welcome to edX for teams!'));
    expect(screen.getByAltText('Celebration of subscription purchase success')).toBeInTheDocument();
  });
});
