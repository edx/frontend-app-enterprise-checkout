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
import { sendEnterpriseCheckoutTrackingEvent } from '@/utils/common';

import StatefulSubscribeButton from '../StatefulSubscribeButton';

// Mock useIntl
jest.mock('@edx/frontend-platform/i18n', () => ({
  ...jest.requireActual('@edx/frontend-platform/i18n'),
  useIntl: jest.fn(),
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
      { id: 'test-intent', country: 'US', state: 'created' },
  })),
}));

jest.mock('@/hooks/useCheckoutFormStore', () => ({
  useCheckoutFormStore: jest.fn(),
}));

jest.mock('@/utils/common', () => ({
  sendEnterpriseCheckoutTrackingEvent: jest.fn(),
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
          checkoutIntentId: 'test-intent',
          eventName: EVENT_NAMES.SUBSCRIPTION_CHECKOUT.PAYMENT_PROCESSED_SUCCESSFULLY,
        });
        expect(mockNavigate).toHaveBeenCalledWith('/billing-details/success');
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
        id: 'test-intent',
        state: 'created',
        termsMetadata: termsAndConditions,
      };

      expect(patchCheckoutIntent).toHaveBeenCalledWith(expectedPatch);
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
});
