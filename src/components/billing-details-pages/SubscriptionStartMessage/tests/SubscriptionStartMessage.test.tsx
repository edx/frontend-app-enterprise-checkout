import { IntlProvider } from '@edx/frontend-platform/i18n';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

import {
  useCheckoutIntent,
  useCreateBillingPortalSession,
  useFirstBillableInvoice,
  usePurchaseSummaryPricing,
} from '@/components/app/data';
import { SubscriptionStartMessage } from '@/components/billing-details-pages/SubscriptionStartMessage';
import BillingDetailsDisclaimer from '@/components/Disclaimer/BillingDetailsDisclaimer';
import { DataStoreKey } from '@/constants/checkout';
import { checkoutFormStore } from '@/hooks/useCheckoutFormStore';
import { sendEnterpriseCheckoutTrackingEvent } from '@/utils/common';

// Mock the useFirstBillableInvoice hook
jest.mock('@/components/app/data', () => ({
  useFirstBillableInvoice: jest.fn(),
  useCreateBillingPortalSession: jest.fn(),
  useCheckoutIntent: jest.fn(),
  usePurchaseSummaryPricing: jest.fn(),
}));

jest.mock('@/utils/common', () => ({
  ...jest.requireActual('@/utils/common'),
  sendEnterpriseCheckoutTrackingEvent: jest.fn(),
}));

const mockUseFirstBillableInvoice = useFirstBillableInvoice as jest.MockedFunction<typeof useFirstBillableInvoice>;

describe('SubscriptionStartMessage', () => {
  beforeEach(() => {
    // Reset sessionStorage between tests
    sessionStorage.clear();
    // Reset shared checkout store fields to avoid cross-test pollution
    checkoutFormStore.setState((s: any) => ({
      ...s,
      productLookupKey: '',
      formData: {
        ...s.formData,
        [DataStoreKey.AcademySelection]: { selectedProduct: null },
      },
    }));
    // Mock the hook to return data that will render "June 9th, 2025"
    (mockUseFirstBillableInvoice as jest.Mock).mockReturnValue({
      data: {
        customerName: 'Bob dole',
        billingAddress: null,
        last4: null,
        quantity: 5,
        unitAmountDecimal: 198000,
        customerPhone: null,
        startTime: '2025-05-10T00:00:00Z', // Start of trial
        endTime: '2025-06-09T00:00:00Z', // End date that formats to "June 9th, 2025"
        hasStartAndEndTime: true,
      },
    });
    (useCreateBillingPortalSession as jest.Mock).mockReturnValue({
      data: {
        url: 'https://stripe-billing.example.com/session',
      },
    });
    (useCheckoutIntent as jest.Mock).mockReturnValue({
      data: {
        id: 7,
      },
    });
    (usePurchaseSummaryPricing as jest.Mock).mockReturnValue({
      yearlySubscriptionCostForQuantity: 150,
    });
  });

  const renderComponent = () => render(
    <IntlProvider locale="en">
      <SubscriptionStartMessage />
    </IntlProvider>,
  );

  it('renders the title correctly for Teams flow', () => {
    renderComponent();
    validateText('Your free 14-day trial for edX Team subscription has started.');
  });

  it('renders the title correctly for Essentials flow', () => {
    sessionStorage.setItem('isEssentials', 'true');
    renderComponent();
    validateText('Your free 14-day trial for edX Essentials subscription has started.');
  });

  it('renders the description message correctly', () => {
    renderComponent();
    // Check for specific text parts in the rendered component
    validateText(/Your trial expires on/i);
    validateText('June 9, 2025');
    validateText('Subscription Management');
  });

  it('renders the bold text correctly', () => {
    renderComponent();
    const boldElement = screen.getByText('June 9, 2025');
    expect(boldElement).toBeInTheDocument();
    expect(boldElement.tagName).toBe('SPAN');
  });

  it('renders the link correctly', async () => {
    const user = userEvent.setup();
    renderComponent();
    const link = screen.getByRole('link', { name: 'Subscription Management' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://stripe-billing.example.com/session');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');

    await user.click(link);

    expect(sendEnterpriseCheckoutTrackingEvent).toHaveBeenCalled();
  });

  it('does not render when data is missing', () => {
    (mockUseFirstBillableInvoice as jest.Mock).mockReturnValue({
      startTime: null,
      endTime: null,
      hasStartAndEndTime: false,
    });
    renderComponent();
    const titleElement = screen.queryByText('Your free trial for edX team\'s subscription has started.');
    expect(titleElement).not.toBeInTheDocument();
    const link = screen.queryByRole('link', { name: 'Subscription Management' });
    expect(link).toBeNull();
  });

  it('displays essentials price when academy product selected', () => {
    (usePurchaseSummaryPricing as jest.Mock).mockImplementation(() => {
      const key = checkoutFormStore.getState().productLookupKey;
      if (key === 'essentials-lookup') {
        return { yearlySubscriptionCostForQuantity: 150 };
      }
      return { yearlySubscriptionCostForQuantity: 300 };
    });

    // Set academy selection in store
    checkoutFormStore.setState((s: any) => ({
      ...s,
      formData: {
        ...s.formData,
        [DataStoreKey.AcademySelection]: {
          selectedProduct: { lookupKey: 'essentials-lookup' },
        },
      },
    }));

    // Also set the product lookup key as the root loader would.
    checkoutFormStore.setState((s: any) => ({
      ...s,
      productLookupKey: 'essentials-lookup',
    }));

    // Mark the session as Essentials flow so component uses product lookupKey pricing
    sessionStorage.setItem('isEssentials', 'true');

    renderComponent();

    // Price should be the essentials price (150) in the rendered description
    validateText(/150/);
    expect(screen.queryByText(/300/)).toBeNull();
  });

  it('BillingDetailsDisclaimer shows essentials price when academy selection set', () => {
    // Override pricing hook to return essentials vs default
    (usePurchaseSummaryPricing as jest.Mock).mockImplementation(() => {
      const key = checkoutFormStore.getState().productLookupKey;
      if (key === 'essentials-lookup') {
        return { yearlySubscriptionCostForQuantity: 150 };
      }
      return { yearlySubscriptionCostForQuantity: 300 };
    });

    // Set academy selection in the shared store
    checkoutFormStore.setState((s: any) => ({
      ...s,
      formData: {
        ...s.formData,
        [DataStoreKey.AcademySelection]: {
          selectedProduct: { lookupKey: 'essentials-lookup' },
        },
      },
    }));

    // Mirror the loader hydration: set active product lookup key
    checkoutFormStore.setState((s: any) => ({
      ...s,
      productLookupKey: 'essentials-lookup',
    }));

    // Render the disclaimer component and assert price
    render(
      <IntlProvider locale="en">
        <BillingDetailsDisclaimer />
      </IntlProvider>,
    );

    const matches = screen.getAllByText(/150/);
    expect(matches.length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText(/300/)).toBeNull();
  });
});
