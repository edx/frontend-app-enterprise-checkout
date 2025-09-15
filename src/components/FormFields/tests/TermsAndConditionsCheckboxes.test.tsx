import { IntlProvider } from '@edx/frontend-platform/i18n';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import { useForm } from 'react-hook-form';

import { DataStoreKey } from '@/constants/checkout';
import EVENT_NAMES from '@/constants/events';
import { checkoutFormStore } from '@/hooks/useCheckoutFormStore';

import TermsAndConditionsCheckboxes from '../TermsAndConditionsCheckboxes';

// Mock Segment tracking util
jest.mock('@edx/frontend-enterprise-utils', () => ({
  sendEnterpriseTrackEvent: jest.fn(),
}));

// Mock checkout intent hook via app data barrel
jest.mock('@/components/app/data', () => ({
  __esModule: true,
  useCheckoutIntent: jest.fn(() => ({ data: { id: 'chk_intent_123', foo: 'bar' } })),
}));

const { sendEnterpriseTrackEvent } = jest.requireMock('@edx/frontend-enterprise-utils');
const { useCheckoutIntent } = jest.requireMock('@/components/app/data');

describe('TermsAndConditionsCheckboxes', () => {
  const TestWrapper: React.FC = () => {
    const form = useForm<BillingDetailsData>({
      mode: 'onTouched',
      defaultValues: {
        confirmTnC: false,
        confirmSubscription: false,
      } as any,
    });
    return (
      <IntlProvider locale="en">
        <TermsAndConditionsCheckboxes form={form} />
      </IntlProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Seed the Zustand store with initial Billing Details values
    checkoutFormStore.setState((s) => ({
      ...s,
      formData: {
        ...s.formData,
        [DataStoreKey.BillingDetails]: {
          ...(s.formData as any)[DataStoreKey.BillingDetails],
          confirmTnC: false,
          confirmSubscription: false,
        },
      },
    }));
  });

  it('renders the expected checkbox labels', () => {
    render(<TestWrapper />);

    // Validate both checkbox label texts render
    validateText('I have read and accepted', { exact: false });
    validateText('I confirm I am subscribing', { exact: false });
  });

  it('sends Segment event with expected payload when toggling T&C checkbox', async () => {
    render(<TestWrapper />);

    const tncCheckbox = screen.getByLabelText(/I have read and accepted/i);
    await userEvent.click(tncCheckbox);

    expect(sendEnterpriseTrackEvent).toHaveBeenCalledWith(
      'chk_intent_123',
      EVENT_NAMES.SUBSCRIPTION_CHECKOUT.TOGGLE_TNC_TERMS,
      expect.objectContaining({
        checkbox_checked: true,
        checkoutIntent: { id: 'chk_intent_123', foo: 'bar' },
      }),
    );
  });

  it('sends Segment event with expected payload when toggling subscription confirmation checkbox', async () => {
    render(<TestWrapper />);

    const subCheckbox = screen.getByLabelText(/I confirm I am subscribing/i);
    await userEvent.click(subCheckbox);

    expect(sendEnterpriseTrackEvent).toHaveBeenCalledWith(
      'chk_intent_123',
      EVENT_NAMES.SUBSCRIPTION_CHECKOUT.TOGGLE_SUBSCRIPTION_TERMS,
      expect.objectContaining({
        checkbox_checked: true,
        checkoutIntent: { id: 'chk_intent_123', foo: 'bar' },
      }),
    );
  });

  it('falls back to empty checkout intent id when checkoutIntent is missing', async () => {
    // Make the hook return null data to test fallback id path
    (useCheckoutIntent as jest.Mock).mockReturnValue({ data: null });

    render(<TestWrapper />);

    const tncCheckbox = screen.getByLabelText(/I have read and accepted/i);
    await userEvent.click(tncCheckbox);

    expect(sendEnterpriseTrackEvent).toHaveBeenCalledWith(
      'empty_checkout_intent_id',
      EVENT_NAMES.SUBSCRIPTION_CHECKOUT.TOGGLE_TNC_TERMS,
      expect.objectContaining({
        checkbox_checked: true,
        checkoutIntent: null,
      }),
    );
  });
});
