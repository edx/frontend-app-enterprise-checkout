import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { getConfig } from '@edx/frontend-platform/config';
import { useIntl } from '@edx/frontend-platform/i18n';
import { logError } from '@edx/frontend-platform/logging';
import { useCheckout } from '@stripe/react-stripe-js';
import { useQueryClient } from '@tanstack/react-query';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom';
import { useNavigate } from 'react-router-dom';

import { termsAndConditions } from '@/components/app/data/constants';
import { patchCheckoutIntent } from '@/components/app/data/services/checkout-intent';
import EVENT_NAMES from '@/constants/events';
import { useCheckoutFormStore } from '@/hooks/useCheckoutFormStore';
import { isEssentialsFlow, sendEnterpriseCheckoutTrackingEvent } from '@/utils/common';

import StatefulSubscribeButton from '../StatefulSubscribeButton';

// Mock useIntl
jest.mock('@edx/frontend-platform/i18n', () => ({
  ...jest.requireActual('@edx/frontend-platform/i18n'),
  useIntl: jest.fn(),
}));

jest.mock('@edx/frontend-platform/analytics', () => ({ sendTrackEvent: jest.fn() }));
jest.mock('@edx/frontend-platform/config', () => ({ getConfig: jest.fn(() => ({})) }));

jest.mock('@/components/app/data/hooks', () => ({
  useCheckoutEventProductProperties: jest.fn(() => ({
    category: 'subscription', name: 'teams', brand: 'enterprise', payment_schedule: 'yearly',
  })),
}));

// Mock other dependencies with simple implementations
jest.mock('@edx/frontend-platform/logging', () => ({
  logError: jest.fn(),
}));

jest.mock('@edx/frontend-platform/react', () => ({
  AppContext: React.createContext({ authenticatedUser: { id: 'test-user' } }),
}));

jest.mock('@stripe/react-stripe-js', () => ({
  useCheckout: jest.fn(),
}));

jest.mock('@tanstack/react-query', () => ({
  useQueryClient: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}));

jest.mock('@/components/app/data', () => ({
  useCheckoutIntent: jest.fn(() => ({
    data:
      {
        uuid: 'test-intent-uuid', id: 1234, country: 'US', state: 'created', quantity: 5,
      },
  })),
}));

jest.mock('@/hooks/useCheckoutFormStore', () => ({
  useCheckoutFormStore: jest.fn(),
}));

jest.mock('@/utils/common', () => ({
  sendEnterpriseCheckoutTrackingEvent: jest.fn(),
  isEssentialsFlow: jest.fn(),
}));

jest.mock('@/components/app/data/services/checkout-intent', () => ({
  patchCheckoutIntent: jest.fn(),
}));

// Mock functions that we'll reuse across tests
const mockNavigate = jest.fn();
const mockConfirm = jest.fn();
const mockInvalidateQueries = jest.fn(() => Promise.resolve());
const mockSetCheckoutSessionStatus = jest.fn();
const mockQueryClient = {
  invalidateQueries: mockInvalidateQueries,
};

function setup(overrides = {}) {
  // Default mock configurations
  const defaultMocks = {
    useIntl: {
      formatMessage: jest.fn((descriptor) => descriptor.defaultMessage || descriptor.id || String(descriptor)),
    },
    useCheckout: {
      canConfirm: true,
      status: { type: 'idle' },
      confirm: mockConfirm,
    },
    useQueryClient: mockQueryClient,
    useNavigate: mockNavigate,
    useCheckoutFormStore: {
      formData: {
        BillingDetails: {
          confirmTnC: true,
          confirmSubscription: true,
        },
      },
      setFormData: jest.fn(),
      productLookupKey: '',
      sspProductSlug: '',
      setSspProductSlug: jest.fn(),
      setProductLookupKey: jest.fn(),
      checkoutSessionClientSecret: undefined,
      checkoutSessionStatus: {
        type: null,
        paymentStatus: null,
      },
      setCheckoutSessionClientSecret: jest.fn(),
      setCheckoutSessionStatus: mockSetCheckoutSessionStatus,
    },
    ...overrides,
  };

  // Apply mocks
  (useIntl as jest.Mock).mockReturnValue(defaultMocks.useIntl);
  (useCheckout as jest.Mock).mockReturnValue(defaultMocks.useCheckout);
  (useQueryClient as jest.Mock).mockReturnValue(defaultMocks.useQueryClient);
  (useNavigate as jest.Mock).mockReturnValue(defaultMocks.useNavigate);
  jest.mocked(useCheckoutFormStore).mockImplementation((selector) => {
    const mockState = defaultMocks.useCheckoutFormStore;
    return selector(mockState);
  });

  return render(<StatefulSubscribeButton />);
}

describe('StatefulSubscribeButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset all mock functions
    mockNavigate.mockClear();
    mockConfirm.mockClear();
    mockInvalidateQueries.mockClear();
    mockSetCheckoutSessionStatus.mockClear();
    (isEssentialsFlow as jest.Mock).mockReturnValue(false);
  });

  describe('Basic rendering', () => {
    it('renders with default state and correct internationalized labels', () => {
      setup();

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Subscribe');
      expect(button).not.toHaveAttribute('aria-disabled', 'true');
    });

    it('has correct button properties', () => {
      setup();

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');
      expect(button).toHaveClass('btn-secondary'); // Default variant
    });

    it('is disabled when form is invalid (confirmTnC is false)', () => {
      // Setup all required mocks for this specific test
      const formatMessage = jest.fn((descriptor) => descriptor.defaultMessage || descriptor.id || String(descriptor));
      (useIntl as jest.Mock).mockReturnValue({ formatMessage });

      (useCheckout as jest.Mock).mockReturnValue({
        canConfirm: true,
        status: { type: 'idle' },
        confirm: mockConfirm,
      });

      (useQueryClient as jest.Mock).mockReturnValue(mockQueryClient);
      (useNavigate as jest.Mock).mockReturnValue(mockNavigate);

      // Mock with invalid form data - confirmTnC false should make hasInvalidTerms true
      jest.mocked(useCheckoutFormStore).mockImplementation((selector) => {
        const mockState = {
          formData: {
            BillingDetails: {
              confirmTnC: false, // This makes form invalid
              confirmSubscription: true,
            },
          },
          setFormData: jest.fn(),
          productLookupKey: '',
          sspProductSlug: '',
          setSspProductSlug: jest.fn(),
          setProductLookupKey: jest.fn(),
          checkoutSessionClientSecret: undefined,
          checkoutSessionStatus: {
            type: null,
            paymentStatus: null,
          },
          setCheckoutSessionClientSecret: jest.fn(),
          setCheckoutSessionStatus: mockSetCheckoutSessionStatus,
        };
        return selector(mockState);
      });

      render(<StatefulSubscribeButton />);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('is disabled when canConfirm is false', () => {
      // Setup all required mocks for this specific test
      const formatMessage = jest.fn((descriptor) => descriptor.defaultMessage || descriptor.id || String(descriptor));
      (useIntl as jest.Mock).mockReturnValue({ formatMessage });

      (useCheckout as jest.Mock).mockReturnValue({
        canConfirm: false, // This should make isFormValid false
        status: { type: 'idle' },
        confirm: mockConfirm,
      });

      (useQueryClient as jest.Mock).mockReturnValue(mockQueryClient);
      (useNavigate as jest.Mock).mockReturnValue(mockNavigate);

      // Mock with all valid form data, but canConfirm is false
      jest.mocked(useCheckoutFormStore).mockImplementation((selector) => {
        const mockState = {
          formData: {
            BillingDetails: {
              confirmTnC: true,
              confirmSubscription: true,
            },
          },
          setFormData: jest.fn(),
          productLookupKey: '',
          sspProductSlug: '',
          setSspProductSlug: jest.fn(),
          setProductLookupKey: jest.fn(),
          checkoutSessionClientSecret: undefined,
          checkoutSessionStatus: {
            type: null,
            paymentStatus: null,
          },
          setCheckoutSessionClientSecret: jest.fn(),
          setCheckoutSessionStatus: mockSetCheckoutSessionStatus,
        };
        return selector(mockState);
      });

      render(<StatefulSubscribeButton />);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('is disabled when confirmSubscription is false', () => {
      // Setup all required mocks for this specific test
      const formatMessage = jest.fn((descriptor) => descriptor.defaultMessage || descriptor.id || String(descriptor));
      (useIntl as jest.Mock).mockReturnValue({ formatMessage });

      (useCheckout as jest.Mock).mockReturnValue({
        canConfirm: true,
        status: { type: 'idle' },
        confirm: mockConfirm,
      });

      (useQueryClient as jest.Mock).mockReturnValue(mockQueryClient);
      (useNavigate as jest.Mock).mockReturnValue(mockNavigate);

      // Mock with invalid form data - confirmSubscription false should make hasInvalidTerms true
      jest.mocked(useCheckoutFormStore).mockImplementation((selector) => {
        const mockState = {
          formData: {
            BillingDetails: {
              confirmTnC: true,
              confirmSubscription: false, // This makes form invalid
            },
          },
          setFormData: jest.fn(),
          productLookupKey: '',
          sspProductSlug: '',
          setSspProductSlug: jest.fn(),
          setProductLookupKey: jest.fn(),
          checkoutSessionClientSecret: undefined,
          checkoutSessionStatus: {
            type: null,
            paymentStatus: null,
          },
          setCheckoutSessionClientSecret: jest.fn(),
          setCheckoutSessionStatus: mockSetCheckoutSessionStatus,
        };
        return selector(mockState);
      });

      render(<StatefulSubscribeButton />);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });
  });

  describe('Click handler and pending state', () => {
    it('calls confirm when clicked and sets pending state', async () => {
      mockConfirm.mockResolvedValue({ type: 'success' });
      setup();

      const button = screen.getByRole('button');

      await act(async () => {
        fireEvent.click(button);
      });

      expect(mockConfirm).toHaveBeenCalledWith({
        redirect: 'if_required',
        returnUrl: expect.stringContaining('/success'),
      });
    });

    it('handles confirm rejection and sets error state', async () => {
      const mockError = { type: 'error', error: { code: 'generic_decline', message: 'Test error' } };
      mockConfirm.mockResolvedValue(mockError);
      setup();

      const button = screen.getByRole('button');

      await act(async () => {
        fireEvent.click(button);
      });

      await waitFor(() => {
        expect(logError).toHaveBeenCalledWith(
          expect.stringContaining('[BillingDetails] Error during self service purchasing Stripe checkout'),
        );
      });
    });

    it('handles card declined error specifically', async () => {
      const mockError = { type: 'error', error: { code: 'card_declined', message: 'Card declined' } };
      mockConfirm.mockResolvedValue(mockError);
      setup();

      const button = screen.getByRole('button');

      await act(async () => {
        fireEvent.click(button);
      });

      await waitFor(() => {
        expect(logError).toHaveBeenCalledWith(
          expect.stringContaining('[BillingDetails] Error during self service purchasing Stripe checkout'),
        );
      });
    });
  });

  describe('Success flow navigation', () => {
    it('navigates to essentials success path when essentials flow is active', async () => {
      (isEssentialsFlow as jest.Mock).mockReturnValue(true);
      mockConfirm.mockResolvedValue({ type: 'success' });
      setup({
        useCheckout: {
          canConfirm: true,
          status: { type: 'complete', paymentStatus: 'paid' },
          confirm: mockConfirm,
        },
      });

      const button = screen.getByRole('button');

      await act(async () => {
        fireEvent.click(button);
      });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/essentials/billing-details/success', { replace: true });
      });
    });

    it('calls navigate when button succeeds and status is complete with paid payment', async () => {
      // Set up with success response and complete/paid status
      mockConfirm.mockResolvedValue({ type: 'success' });
      setup({
        useCheckout: {
          canConfirm: true,
          status: { type: 'complete', paymentStatus: 'paid' },
          confirm: mockConfirm,
        },
      });

      const button = screen.getByRole('button');

      await act(async () => {
        fireEvent.click(button);
      });

      // Wait for the useEffect to trigger after state changes to 'success'
      await waitFor(() => {
        expect(mockSetCheckoutSessionStatus).toHaveBeenCalledWith({ type: 'complete', paymentStatus: 'paid' });
        expect(mockInvalidateQueries).toHaveBeenCalled();
        expect(jest.mocked(sendEnterpriseCheckoutTrackingEvent)).toHaveBeenCalledWith({
          checkoutIntentId: 1234,
          checkoutIntentUuid: 'test-intent-uuid',
          eventName: EVENT_NAMES.SUBSCRIPTION_CHECKOUT.PAYMENT_PROCESSED_SUCCESSFULLY,
        });
        expect(mockNavigate).toHaveBeenCalledWith('/billing-details/success', { replace: true });
      });
    });

    it('does not navigate when status is not complete', async () => {
      mockConfirm.mockResolvedValue({ type: 'success' });
      setup({
        useCheckout: {
          canConfirm: true,
          status: { type: 'incomplete', paymentStatus: 'paid' },
          confirm: mockConfirm,
        },
      });

      const button = screen.getByRole('button');

      await act(async () => {
        fireEvent.click(button);
      });

      // Should not navigate when status is not complete
      await waitFor(() => {
        expect(mockNavigate).not.toHaveBeenCalled();
      }, { timeout: 1000 });
    });

    it('does not navigate when paymentStatus is not paid', async () => {
      mockConfirm.mockResolvedValue({ type: 'success' });
      setup({
        useCheckout: {
          canConfirm: true,
          status: { type: 'complete', paymentStatus: 'unpaid' },
          confirm: mockConfirm,
        },
      });

      const button = screen.getByRole('button');

      await act(async () => {
        fireEvent.click(button);
      });

      // Should not navigate when payment is not paid
      await waitFor(() => {
        expect(mockNavigate).not.toHaveBeenCalled();
      }, { timeout: 1000 });
    });

    it('calls patchCheckoutIntent with checked terms and conditions', async () => {
      mockConfirm.mockResolvedValue({ type: 'success' });
      setup();

      const button = screen.getByRole('button');
      await act(async () => {
        fireEvent.click(button);
      });

      const expectedPatch = {
        country: 'US',
        state: 'created',
        termsMetadata: termsAndConditions,
      };

      expect(patchCheckoutIntent).toHaveBeenCalledWith({
        uuid: 'test-intent-uuid',
        requestData: expectedPatch,
      });
    });
  });

  describe('Internationalization', () => {
    it('tests internationalization integration', () => {
      const mockFormatMessage = jest.fn((descriptor) => descriptor.defaultMessage);
      setup({
        useIntl: {
          formatMessage: mockFormatMessage,
        },
      });

      // Verify that formatMessage is called with the correct message descriptors
      expect(mockFormatMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'checkout.billingDetails.statefulSubscribeButton.subscribe',
          defaultMessage: 'Subscribe',
        }),
      );

      expect(mockFormatMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'checkout.billingDetails.statefulSubscribeButton.processing',
          defaultMessage: 'Processing...',
        }),
      );

      expect(mockFormatMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'checkout.billingDetails.statefulSubscribeButton.success',
          defaultMessage: 'Success',
        }),
      );
    });
  });
  describe('checkout_step_completed.billing_details event', () => {
    const paidCheckout = {
      canConfirm: true,
      status: { type: 'complete', paymentStatus: 'paid' },
      confirm: mockConfirm,
      id: 'cs_test_123',
      minorUnitsAmountDivisor: 100,
      total: { total: { minorUnitsAmount: 74500, amount: '$745.00' } },
    };
    const billingCompletedCalls = () => jest.mocked(sendTrackEvent).mock.calls
      .filter(([name]) => name === EVENT_NAMES.CHECKOUT.STEP_COMPLETED_BILLING_DETAILS);

    beforeEach(() => {
      (getConfig as jest.Mock).mockReturnValue({ FEATURE_SSP_CHECKOUT_SEGMENT_EVENTS_V2: 'true' });
    });

    afterEach(() => {
      (getConfig as jest.Mock).mockReturnValue({});
    });

    it('fires once with product, step and order properties after Stripe confirms payment', async () => {
      mockConfirm.mockResolvedValue({ type: 'success' });
      setup({ useCheckout: paidCheckout });

      await act(async () => {
        fireEvent.click(screen.getByRole('button'));
      });

      await waitFor(() => expect(mockNavigate).toHaveBeenCalled());
      expect(billingCompletedCalls()).toEqual([[
        EVENT_NAMES.CHECKOUT.STEP_COMPLETED_BILLING_DETAILS,
        {
          category: 'subscription',
          name: 'teams',
          brand: 'enterprise',
          payment_schedule: 'yearly',
          step_name: 'Billing Details',
          step_number: 3,
          order_id: 'cs_test_123',
          total_quantity: 5,
          revenue: 745,
        },
      ]]);
    });

    it('does not fire when the payment fails', async () => {
      mockConfirm.mockResolvedValue({ type: 'error', error: { code: 'paymentFailed' } });
      setup({ useCheckout: paidCheckout });

      await act(async () => {
        fireEvent.click(screen.getByRole('button'));
      });

      await waitFor(() => expect(screen.getByRole('button')).toHaveTextContent('Error, card declined.'));
      expect(billingCompletedCalls()).toHaveLength(0);
    });

    it('does not fire when the checkout session is not paid', async () => {
      mockConfirm.mockResolvedValue({ type: 'success' });
      setup({ useCheckout: { ...paidCheckout, status: { type: 'complete', paymentStatus: 'unpaid' } } });

      await act(async () => {
        fireEvent.click(screen.getByRole('button'));
      });

      expect(mockNavigate).not.toHaveBeenCalled();
      expect(billingCompletedCalls()).toHaveLength(0);
    });
  });
});
