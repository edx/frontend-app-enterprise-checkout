import { getConfig } from '@edx/frontend-platform/config';
import { CheckoutProvider } from '@stripe/react-stripe-js';
import { render, screen } from '@testing-library/react';

import { useCheckoutSessionClientSecret } from '@/components/app/data';

import StripeProvider from '../StripeProvider';

jest.mock('@edx/frontend-platform/config', () => ({
  getConfig: jest.fn(),
}));

jest.mock('@stripe/stripe-js', () => ({
  loadStripe: jest.fn(() => Promise.resolve({})),
}));

jest.mock('@stripe/react-stripe-js', () => ({
  CheckoutProvider: jest.fn(({ children }) => <div data-testid="checkout-provider">{children}</div>),
}));

jest.mock('@/components/app/data', () => ({
  useCheckoutSessionClientSecret: jest.fn(),
}));

jest.mock('@/components/StripeProvider/utils', () => ({
  createStripeAppearance: jest.fn(() => ({ theme: 'flat' })),
}));

describe('StripeProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getConfig as jest.Mock).mockReturnValue({ PUBLISHABLE_STRIPE_API_KEY: 'pk_test_123' });
  });

  it('returns null when checkout session client secret is missing', () => {
    (useCheckoutSessionClientSecret as jest.Mock).mockReturnValue(undefined);

    const { container } = render(
      <StripeProvider>
        <div>Child content</div>
      </StripeProvider>,
    );

    expect(container.firstChild).toBeNull();
    expect(CheckoutProvider).not.toHaveBeenCalled();
  });

  it('renders children and resolves fetchClientSecret when secret is provided', async () => {
    (useCheckoutSessionClientSecret as jest.Mock).mockReturnValue('secret_123');

    render(
      <StripeProvider>
        <div>Child content</div>
      </StripeProvider>,
    );

    expect(screen.getByText('Child content')).toBeInTheDocument();
    expect(CheckoutProvider).toHaveBeenCalled();

    const checkoutProviderProps = (CheckoutProvider as jest.Mock).mock.calls[0][0];
    await expect(checkoutProviderProps.options.fetchClientSecret()).resolves.toBe('secret_123');
  });

  it('wraps rejected Error values with a Stripe initialization message', async () => {
    const rejectedThenable = {
      then: (_resolve: unknown, reject: (reason: Error) => void) => reject(new Error('boom')),
    };
    (useCheckoutSessionClientSecret as jest.Mock).mockReturnValue(rejectedThenable);

    render(
      <StripeProvider>
        <div>Child content</div>
      </StripeProvider>,
    );

    const checkoutProviderProps = (CheckoutProvider as jest.Mock).mock.calls[0][0];
    await expect(checkoutProviderProps.options.fetchClientSecret()).rejects.toThrow(
      'Stripe session initialization failed: boom',
    );
  });

  it('wraps rejected string values with a Stripe initialization message', async () => {
    const rejectedThenable = {
      then: (_resolve: unknown, reject: (reason: string) => void) => reject('raw string error'),
    };
    (useCheckoutSessionClientSecret as jest.Mock).mockReturnValue(rejectedThenable);

    render(
      <StripeProvider>
        <div>Child content</div>
      </StripeProvider>,
    );

    const checkoutProviderProps = (CheckoutProvider as jest.Mock).mock.calls[0][0];
    await expect(checkoutProviderProps.options.fetchClientSecret()).rejects.toThrow(
      'Stripe session initialization failed: raw string error',
    );
  });

  it('wraps rejected object values by JSON stringifying them', async () => {
    const rejectedThenable = {
      then: (_resolve: unknown, reject: (reason: object) => void) => reject({ type: 'invalid_request_error' }),
    };
    (useCheckoutSessionClientSecret as jest.Mock).mockReturnValue(rejectedThenable);

    render(
      <StripeProvider>
        <div>Child content</div>
      </StripeProvider>,
    );

    const checkoutProviderProps = (CheckoutProvider as jest.Mock).mock.calls[0][0];
    await expect(checkoutProviderProps.options.fetchClientSecret()).rejects.toThrow(
      'Stripe session initialization failed: {"type":"invalid_request_error"}',
    );
  });
});
