import { IntlProvider } from '@edx/frontend-platform/i18n';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { ContactSupport } from '@/components/billing-details-pages/ContactSupport';
import { DataStoreKey } from '@/constants/checkout';
import EVENT_NAMES from '@/constants/events';
import { checkoutFormStore } from '@/hooks/useCheckoutFormStore';

import OrderDetails from '../OrderDetails';

// Mock the hooks
jest.mock('@/components/app/data', () => ({
  ...jest.requireActual('@/components/app/data'),
  useFirstBillableInvoice: jest.fn(),
  useCheckoutIntent: jest.fn(),
}));

jest.mock('@edx/frontend-platform/config', () => ({
  getConfig: jest.fn(() => ({
    CONTACT_SUPPORT_URL: 'https://support.example.com',
  })),
}));

jest.mock('@/utils/common', () => ({
  ...jest.requireActual('@/utils/common'),
  sendEnterpriseCheckoutTrackingEvent: jest.fn(),
}));

jest.mock('@/components/app/routes/loaders/utils', () => ({
  ...jest.requireActual('@/components/app/routes/loaders/utils'),
  isEssentialsFlow: jest.fn(() => false),
}));

const { useFirstBillableInvoice, useCheckoutIntent } = jest.requireMock('@/components/app/data');

describe('OrderDetails', () => {
  const mockAdminEmail = 'admin@example.com';
  const mockBillingAddress = {
    line1: '123 Main St',
    line2: 'Apt 4B',
    city: 'Boston',
    state: 'MA',
    postalCode: '02101',
    country: 'US',
  };
  const mockPhone = '(555) 123-4567';
  const mockLast4 = '4242';
  const DEFAULT_INVOICE = {
    billingAddress: {
      city: null,
      country: null,
      line1: null,
      line2: null,
      postalCode: null,
      state: null,
    },
    customerPhone: null,
    last4: 0,
    cardBrand: 'card',
    startTime: null,
    endTime: null,
    quantity: 0,
    unitAmountDecimal: 0,
    customerName: null,
    hasBillingAddress: false,
    hasCardDetails: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Set up default form store state
    checkoutFormStore.setState({
      formData: {
        [DataStoreKey.PlanDetails]: {
          adminEmail: mockAdminEmail,
        },
        [DataStoreKey.AccountDetails]: {},
        [DataStoreKey.BillingDetails]: {},
      },
      checkoutSessionStatus: {
        type: null,
        paymentStatus: null,
      },
      setFormData: jest.fn(),
      setCheckoutSessionStatus: jest.fn(),
    });

    // Default mock for useFirstBillableInvoice - ensure component renders by default
    (useFirstBillableInvoice as jest.Mock).mockReturnValue({
      data: {
        ...DEFAULT_INVOICE,
        last4: mockLast4,
        cardBrand: 'visa',
        hasCardDetails: true,
      },
      isLoading: false,
    });

    // Default mock for useCheckoutIntent
    (useCheckoutIntent as jest.Mock).mockReturnValue({
      data: { id: 'test-checkout-intent-id' },
      isLoading: false,
    });
  });

  const renderComponent = () => render(
    <IntlProvider locale="en">
      <OrderDetails />
    </IntlProvider>,
  );

  describe('Basic rendering', () => {
    it('returns null when firstBillableInvoice data is not available', () => {
      (useFirstBillableInvoice as jest.Mock).mockReturnValue({
        data: null,
        isLoading: false,
      });

      const { container } = renderComponent();
      expect(container.firstChild).toBeNull();
    });

    it.each([
      ['the title', 'Order details'],
      ['the description', 'You have purchased an edX Team subscription.'],
    ])('renders %s correctly', (_label, expectedText) => {
      renderComponent();
      validateText(expectedText);
    });

    it('renders all section headings', () => {
      (useFirstBillableInvoice as jest.Mock).mockReturnValue({
        data: {
          last4: mockLast4,
          cardBrand: 'visa',
          hasCardDetails: true,
          hasBillingAddress: false,
        },
        isLoading: false,
      });

      renderComponent();
      validateText('Admin contact information');
      validateText('Payment method');
      validateText('Billing address');
    });
  });

  describe('Admin contact information', () => {
    it('displays admin email from plan details form data', () => {
      (useFirstBillableInvoice as jest.Mock).mockReturnValue({
        data: {
          last4: mockLast4,
          cardBrand: 'visa',
          hasCardDetails: true,
        },
        isLoading: false,
      });

      renderComponent();
      expect(screen.getByText(mockAdminEmail)).toBeInTheDocument();
    });

    it('displays empty string when admin email is not available', () => {
      (useFirstBillableInvoice as jest.Mock).mockReturnValue({
        data: {
          last4: mockLast4,
          cardBrand: 'visa',
          hasCardDetails: true,
        },
        isLoading: false,
      });

      checkoutFormStore.setState({
        formData: {
          [DataStoreKey.PlanDetails]: {},
          [DataStoreKey.AccountDetails]: {},
          [DataStoreKey.BillingDetails]: {},
        },
      });

      renderComponent();
      validateText('Admin contact information');
      // Email section should still render but be empty
    });
  });

  describe('Payment method', () => {
    it('displays card ending with last 4 digits from Stripe when available', () => {
      (useFirstBillableInvoice as jest.Mock).mockReturnValue({
        data: {
          last4: mockLast4,
          cardBrand: 'visa',
          hasCardDetails: true,
        },
        isLoading: false,
      });

      renderComponent();
      expect(screen.getByText(/Visa ending with 4242/)).toBeInTheDocument();
    });

    it('does not render when no card details or billing address are available', () => {
      (useFirstBillableInvoice as jest.Mock).mockReturnValue({
        data: {
          ...DEFAULT_INVOICE,
          hasCardDetails: false,
          hasBillingAddress: false,
        },
        isLoading: false,
      });

      renderComponent();
      expect(screen.queryByText('Order details')).not.toBeInTheDocument();
      expect(screen.queryByText(/Payment method/i)).not.toBeInTheDocument();
    });
  });

  describe('Billing address', () => {
    it('displays full billing address from Stripe when available', () => {
      (useFirstBillableInvoice as jest.Mock).mockReturnValue({
        data: {
          last4: mockLast4,
          cardBrand: 'visa',
          billingAddress: mockBillingAddress,
          customerPhone: mockPhone,
          hasBillingAddress: true,
        },
        isLoading: false,
      });

      renderComponent();

      // Check that all address components are displayed
      expect(screen.getByText(mockBillingAddress.line1)).toBeInTheDocument();
      expect(screen.getByText(mockBillingAddress.line2)).toBeInTheDocument();
      // City, state, and postal code are combined on one line
      expect(screen.getByText(`${mockBillingAddress.city}, ${mockBillingAddress.state}, ${mockBillingAddress.postalCode}`)).toBeInTheDocument();
      expect(screen.getByText(mockBillingAddress.country)).toBeInTheDocument();
      expect(screen.getByText(mockPhone)).toBeInTheDocument();
    });

    it('handles missing billing address gracefully', () => {
      (useFirstBillableInvoice as jest.Mock).mockReturnValue({
        data: {
          ...DEFAULT_INVOICE,
          billingAddress: null,
          customerPhone: '',
          hasCardDetails: true,
          hasBillingAddress: false,
        },
        isLoading: false,
      });

      const { container } = renderComponent();
      // Heading should still render
      validateText('Billing address');
      // No address lines should be rendered
      const addressLines = container.querySelectorAll('.pgn__vstack.text-muted span');
      expect(addressLines.length).toBe(0);
    });

    it('handles partial billing address data', () => {
      (useFirstBillableInvoice as jest.Mock).mockReturnValue({
        data: {
          ...DEFAULT_INVOICE,
          billingAddress: {
            line1: '123 Main St',
            city: 'Boston',
          },
          hasCardDetails: true, // ensure component renders
          hasBillingAddress: false,
        },
        isLoading: false,
      });

      renderComponent();
      expect(screen.getByText(/123 Main St/)).toBeInTheDocument();
      expect(screen.getByText(/Boston/)).toBeInTheDocument();
    });

    it('renders address with proper formatting', () => {
      (useFirstBillableInvoice as jest.Mock).mockReturnValue({
        data: {
          ...DEFAULT_INVOICE,
          billingAddress: mockBillingAddress,
          customerPhone: mockPhone,
          last4: mockLast4,
          cardBrand: 'visa',
          hasBillingAddress: true,
        },
        isLoading: false,
      });

      const { container } = renderComponent();
      // Stack component is used now instead of address element
      const stackElement = container.querySelector('.pgn__vstack.text-muted');
      expect(stackElement).toBeInTheDocument();
      expect(stackElement).toHaveClass('text-muted');
    });
  });

  describe('Integration with first billable invoice', () => {
    it.each([
      ['loading state', { data: DEFAULT_INVOICE, isLoading: true }],
      ['default invoice without card/address', { data: DEFAULT_INVOICE, isLoading: false }],
    ])('does not render when %s', (_label, mockReturn) => {
      (useFirstBillableInvoice as jest.Mock).mockReturnValue(mockReturn);
      renderComponent();
      expect(screen.queryByText('Order details')).not.toBeInTheDocument();
    });

    it('displays all information when fully populated', () => {
      (useFirstBillableInvoice as jest.Mock).mockReturnValue({
        data: {
          ...DEFAULT_INVOICE,
          last4: mockLast4,
          cardBrand: 'visa',
          billingAddress: mockBillingAddress,
          customerPhone: mockPhone,
          quantity: 10,
          hasBillingAddress: true,
          hasCardDetails: true,
        },
        isLoading: false,
      });

      renderComponent();

      expect(screen.getByText(mockAdminEmail)).toBeInTheDocument();
      expect(screen.getByText(/Visa ending with 4242/)).toBeInTheDocument();

      // Check that address and phone are rendered
      expect(screen.getByText(mockBillingAddress.line1)).toBeInTheDocument();
      expect(screen.getByText(mockPhone)).toBeInTheDocument();
    });
  });

  describe('Tracking events', () => {
    it('sends tracking event when contact support link is clicked', () => {
      const { sendEnterpriseCheckoutTrackingEvent } = jest.requireMock('@/utils/common');
      const mockCheckoutIntentId = 'test-checkout-intent-123';
      const mockCheckoutIntentUuid = 'test-checkout-intent-uuid-123';

      (useCheckoutIntent as jest.Mock).mockReturnValue({
        data: { id: mockCheckoutIntentId, uuid: mockCheckoutIntentUuid },
        isLoading: false,
      });

      // Render ContactSupport directly, as it is now a separate component
      render(
        <IntlProvider locale="en">
          <ContactSupport />
        </IntlProvider>,
      );

      const contactSupportLink = screen.getByText('contact support', { selector: 'a' });
      contactSupportLink.click();

      expect(sendEnterpriseCheckoutTrackingEvent).toHaveBeenCalledWith({
        checkoutIntentId: mockCheckoutIntentId,
        checkoutIntentUuid: mockCheckoutIntentUuid,
        eventName: EVENT_NAMES.SUBSCRIPTION_CHECKOUT.CONTACT_SUPPORT_LINK_CLICKED,
      });
    });
  });

  describe('Academy Name (Essentials flow)', () => {
    it('displays Academy Name label with placeholder dash when in Essentials flow', () => {
      const { isEssentialsFlow } = jest.requireMock('@/components/app/routes/loaders/utils');
      (isEssentialsFlow as jest.Mock).mockReturnValue(true);

      (useFirstBillableInvoice as jest.Mock).mockReturnValue({
        data: {
          last4: mockLast4,
          cardBrand: 'visa',
          hasCardDetails: true,
        },
        isLoading: false,
      });

      renderComponent();
      validateText('Academy Name');
      expect(screen.getByText('—')).toBeInTheDocument();
    });

    it('does not display Academy Name section when not in Essentials flow', () => {
      const { isEssentialsFlow } = jest.requireMock('@/components/app/routes/loaders/utils');
      (isEssentialsFlow as jest.Mock).mockReturnValue(false);

      (useFirstBillableInvoice as jest.Mock).mockReturnValue({
        data: {
          last4: mockLast4,
          cardBrand: 'visa',
          hasCardDetails: true,
        },
        isLoading: false,
      });

      renderComponent();
      expect(screen.queryByText('Academy Name')).not.toBeInTheDocument();
    });
  });
});
