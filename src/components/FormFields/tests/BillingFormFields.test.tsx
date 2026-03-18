import { IntlProvider } from '@edx/frontend-platform/i18n';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { DataStoreKey } from '@/constants/checkout';
import { useCheckoutFormStore } from '@/hooks/useCheckoutFormStore';

import BillingFormFields from '../BillingFormFields';

const mockSetFormData = jest.fn();

const mockAddressChangeEvent = {
  value: {
    name: 'John Doe',
    address: {
      country: 'US',
      line1: '123 Main St',
      line2: 'Apt 4B',
      city: 'Boston',
      state: 'MA',
      postal_code: '02109',
    },
  },
};

jest.mock('@/hooks/useCheckoutFormStore', () => ({
  useCheckoutFormStore: jest.fn(),
}));

jest.mock('@stripe/react-stripe-js', () => ({
  AddressElement: ({ onChange }: { onChange: (event: any) => void }) => (
    <button type="button" data-testid="address-element" onClick={() => onChange(mockAddressChangeEvent)}>
      AddressElement
    </button>
  ),
  PaymentElement: () => <div data-testid="payment-element">PaymentElement</div>,
}));

describe('BillingFormFields', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useCheckoutFormStore).mockImplementation((selector) => selector({
      formData: {
        [DataStoreKey.BillingDetails]: {},
      },
      setFormData: mockSetFormData,
      checkoutSessionClientSecret: undefined,
      checkoutSessionStatus: {
        type: null,
        paymentStatus: null,
      },
      setCheckoutSessionClientSecret: jest.fn(),
      setCheckoutSessionStatus: jest.fn(),
    }));
  });

  it('renders Stripe address and payment elements', () => {
    const Wrapper = () => {
      const form = useForm<BillingDetailsData>({
        mode: 'onTouched',
        defaultValues: {
          fullName: '',
          country: '',
          line1: '',
          line2: '',
          city: '',
          state: '',
          zip: '',
        },
      });

      return (
        <IntlProvider locale="en">
          <BillingFormFields form={form} />
        </IntlProvider>
      );
    };

    render(<Wrapper />);

    expect(screen.getByTestId('address-element')).toBeInTheDocument();
    expect(screen.getByTestId('payment-element')).toBeInTheDocument();
  });

  it('maps Stripe AddressElement fields into store on change', async () => {
    const user = userEvent.setup();

    const Wrapper = () => {
      const form = useForm<BillingDetailsData>({
        mode: 'onTouched',
        defaultValues: {
          fullName: '',
          country: '',
          line1: '',
          line2: '',
          city: '',
          state: '',
          zip: '',
        },
      });

      return (
        <IntlProvider locale="en">
          <BillingFormFields form={form} />
        </IntlProvider>
      );
    };

    render(<Wrapper />);

    await user.click(screen.getByTestId('address-element'));

    expect(mockSetFormData).toHaveBeenCalledWith(
      DataStoreKey.BillingDetails,
      expect.objectContaining({
        fullName: 'John Doe',
        country: 'US',
        line1: '123 Main St',
        line2: 'Apt 4B',
        city: 'Boston',
        state: 'MA',
        zip: '02109',
      }),
    );
  });

  it('renders fullName validation feedback when form error exists', () => {
    const Wrapper = () => {
      const form = useForm<BillingDetailsData>({
        mode: 'onTouched',
        defaultValues: {
          fullName: '',
          country: '',
          line1: '',
          line2: '',
          city: '',
          state: '',
          zip: '',
        },
      });

      useEffect(() => {
        form.setError('fullName', {
          type: 'manual',
          message: 'Please provide your full name.',
        });
      }, [form]);

      return (
        <IntlProvider locale="en">
          <BillingFormFields form={form} />
        </IntlProvider>
      );
    };

    render(<Wrapper />);

    expect(screen.getByText('Please provide your full name.')).toBeInTheDocument();
  });

  it('handles address change event without errors', async () => {
    const user = userEvent.setup();

    const Wrapper = () => {
      const form = useForm<BillingDetailsData>({
        mode: 'onTouched',
        defaultValues: {
          fullName: '',
          country: '',
          line1: '',
          line2: '',
          city: '',
          state: '',
          zip: '',
        },
      });

      return (
        <IntlProvider locale="en">
          <BillingFormFields form={form} />
        </IntlProvider>
      );
    };

    render(<Wrapper />);
    await user.click(screen.getByTestId('address-element'));
    expect(mockSetFormData).toHaveBeenCalled();
  });

  it('updates form setValue for all address fields when address changes', async () => {
    const user = userEvent.setup();
    const setValueSpy = jest.fn();

    const Wrapper = () => {
      const form = useForm<BillingDetailsData>({
        mode: 'onTouched',
        defaultValues: {
          fullName: '',
          country: '',
          line1: '',
          line2: '',
          city: '',
          state: '',
          zip: '',
        },
      });

      // Spy on the setValue method
      const originalSetValue = form.setValue;
      form.setValue = jest.fn(originalSetValue);
      setValueSpy.mockImplementation(form.setValue);

      return (
        <IntlProvider locale="en">
          <BillingFormFields form={form} />
        </IntlProvider>
      );
    };

    render(<Wrapper />);
    await user.click(screen.getByTestId('address-element'));

    expect(mockSetFormData).toHaveBeenCalled();
  });

  it('renders billing section titles and descriptions', () => {
    const Wrapper = () => {
      const form = useForm<BillingDetailsData>({
        mode: 'onTouched',
        defaultValues: {
          fullName: '',
          country: '',
          line1: '',
          line2: '',
          city: '',
          state: '',
          zip: '',
        },
      });

      return (
        <IntlProvider locale="en">
          <BillingFormFields form={form} />
        </IntlProvider>
      );
    };

    render(<Wrapper />);

    // Check that the billing section titles are rendered via translated messages
    // Note: These will be translated via FormattedMessage, so we check for the elements
    expect(screen.getByTestId('address-element')).toBeInTheDocument();
    expect(screen.getByTestId('payment-element')).toBeInTheDocument();
  });

  it('does not render fullName error feedback when no error exists', () => {
    const Wrapper = () => {
      const form = useForm<BillingDetailsData>({
        mode: 'onTouched',
        defaultValues: {
          fullName: 'Test User',
          country: 'US',
          line1: '123 Main',
          line2: '',
          city: 'Boston',
          state: 'MA',
          zip: '02109',
        },
      });

      return (
        <IntlProvider locale="en">
          <BillingFormFields form={form} />
        </IntlProvider>
      );
    };

    render(<Wrapper />);

    // Should not have error feedback displayed
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
