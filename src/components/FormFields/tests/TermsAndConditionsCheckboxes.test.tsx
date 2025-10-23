import { IntlProvider } from '@edx/frontend-platform/i18n';
import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import { useForm } from 'react-hook-form';

import { DataStoreKey } from '@/constants/checkout';
import EVENT_NAMES from '@/constants/events';
import { checkoutFormStore } from '@/hooks/useCheckoutFormStore';
import { queryClient } from '@/utils/tests';

import TermsAndConditionsCheckboxes from '../TermsAndConditionsCheckboxes';

// Mock internal tracking util
jest.mock('@/utils/common', () => ({
  ...jest.requireActual('@/utils/common'),
  sendEnterpriseCheckoutTrackingEvent: jest.fn(),
}));

// Mock checkout intent hook via app data barrel
jest.mock('@/components/app/data', () => ({
  ...jest.requireActual('@/components/app/data'),
  useCheckoutIntent: jest.fn(),
}));

const { sendEnterpriseCheckoutTrackingEvent } = jest.requireMock('@/utils/common');
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
      <QueryClientProvider client={queryClient()}>
        <IntlProvider locale="en">
          <TermsAndConditionsCheckboxes form={form} />
        </IntlProvider>
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useCheckoutIntent as jest.Mock).mockReturnValue({
      data: {
        id: 1,
        foo: 'bar',
      },
    });
    checkoutFormStore.setState((s) => ({
      ...s,
      formData: {
        ...s.formData,
        [DataStoreKey.BillingDetails]: {
          ...(s.formData as any)[DataStoreKey.BillingDetails],
          confirmTnC: false,
          confirmSubscription: false,
          confirmRecurringSubscription: false,
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

    expect(sendEnterpriseCheckoutTrackingEvent).toHaveBeenCalledWith({
      checkoutIntentId: 1,
      eventName: EVENT_NAMES.SUBSCRIPTION_CHECKOUT.TOGGLE_TNC_TERMS,
      properties: expect.objectContaining({
        checkbox_checked: true,
      }),
    });
  });

  it('sends Segment event with expected payload when toggling subscription confirmation checkbox', async () => {
    render(<TestWrapper />);

    const subCheckbox = screen.getByLabelText(/I confirm I am subscribing/i);
    await userEvent.click(subCheckbox);

    expect(sendEnterpriseCheckoutTrackingEvent).toHaveBeenCalledWith({
      checkoutIntentId: 1,
      eventName: EVENT_NAMES.SUBSCRIPTION_CHECKOUT.TOGGLE_SUBSCRIPTION_TERMS,
      properties: expect.objectContaining({
        checkbox_checked: true,
      }),
    });
  });

  it('falls back to empty checkout intent id when checkoutIntent is missing', async () => {
    // Make the hook return null data to test fallback id path
    (useCheckoutIntent as jest.Mock).mockReturnValue({ data: null });

    render(<TestWrapper />);

    const tncCheckbox = screen.getByLabelText(/I have read and accepted/i);
    await userEvent.click(tncCheckbox);

    expect(sendEnterpriseCheckoutTrackingEvent).toHaveBeenCalledWith({
      checkoutIntentId: null,
      eventName: EVENT_NAMES.SUBSCRIPTION_CHECKOUT.TOGGLE_TNC_TERMS,
      properties: expect.objectContaining({
        checkbox_checked: true,
      }),
    });
  });
});
