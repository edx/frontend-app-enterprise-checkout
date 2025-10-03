import { IntlProvider } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { useBFFSuccess, usePolledCheckoutIntent } from '@/components/app/data';
import { StatefulProvisioningButton } from '@/components/StatefulButton';
import { queryClient } from '@/utils/tests';

// Mock the data hooks
jest.mock('@/components/app/data', () => ({
  useBFFSuccess: jest.fn(),
  usePolledCheckoutIntent: jest.fn(),
}));

const mockUseBFFSuccess = useBFFSuccess as jest.MockedFunction<typeof useBFFSuccess>;
const mockUsePolledCheckoutIntent = usePolledCheckoutIntent as jest.MockedFunction<typeof usePolledCheckoutIntent>;

// Mock window.location.href
const originalLocation = window.location;
beforeAll(() => {
  delete (window as any).location;
  window.location = { ...originalLocation, href: '' };
});

afterAll(() => {
  window.location = originalLocation;
});

describe('StatefulProvisioningButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (mockUsePolledCheckoutIntent as jest.Mock).mockReturnValue({ data: null });
    (mockUseBFFSuccess as jest.Mock).mockReturnValue({ data: null });
  });

  const renderComponent = () => render(
    <QueryClientProvider client={queryClient()}>
      <IntlProvider locale="en">
        <AppContext.Provider value={{ authenticatedUser: { userId: 1 } as any, config: {} }}>
          <StatefulProvisioningButton />
        </AppContext.Provider>
      </IntlProvider>
    </QueryClientProvider>,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    window.location.href = '';
  });

  it('renders with pending state by default', () => {
    (mockUsePolledCheckoutIntent as jest.Mock).mockReturnValue({ data: null });
    (mockUseBFFSuccess as jest.Mock).mockReturnValue({ data: null });

    renderComponent();

    validateText('Creating your account');

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).toHaveClass('btn-secondary');
  });

  it('renders with success state when checkout intent is fulfilled', () => {
    (mockUsePolledCheckoutIntent as jest.Mock).mockReturnValue({
      data: { state: 'fulfilled' },
    });
    (mockUseBFFSuccess as jest.Mock).mockReturnValue({
      data: {
        checkoutIntent: { adminPortalUrl: 'https://admin.example.com' },
      },
    });

    renderComponent();

    validateText('Go to dashboard');

    const button = screen.getByRole('button');
    expect(button).not.toBeDisabled();
    expect(button).toHaveClass('btn-secondary');
    expect(button).toHaveClass('reverse-stateful-provisioning-success');
  });

  it('renders with error state when checkout intent has error', () => {
    (mockUsePolledCheckoutIntent as jest.Mock).mockReturnValue({
      data: { state: 'errored_provisioning' },
    });
    (mockUseBFFSuccess as jest.Mock).mockReturnValue({ data: null });

    renderComponent();

    validateText('Error, try again.');

    const button = screen.getByRole('button');
    expect(button).not.toBeDisabled();
    expect(button).toHaveClass('btn-danger');
  });

  it('renders with error state when checkout intent has stripe error', () => {
    (mockUsePolledCheckoutIntent as jest.Mock).mockReturnValue({
      data: { state: 'errored_stripe_checkout' },
    });
    (mockUseBFFSuccess as jest.Mock).mockReturnValue({ data: null });

    renderComponent();

    validateText('Error, try again.');

    const button = screen.getByRole('button');
    expect(button).toHaveClass('btn-danger');
  });

  it('redirects to admin portal URL when success button is clicked', () => {
    const adminPortalUrl = 'https://admin.example.com/dashboard';

    (mockUsePolledCheckoutIntent as jest.Mock).mockReturnValue({
      data: { state: 'fulfilled' },
    });
    (mockUseBFFSuccess as jest.Mock).mockReturnValue({
      data: {
        checkoutIntent: { adminPortalUrl },
      },
    });

    renderComponent();

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(window.location.href).toBe(adminPortalUrl);
  });

  it('does not redirect when success button is clicked but no admin portal URL', () => {
    (mockUsePolledCheckoutIntent as jest.Mock).mockReturnValue({
      data: { state: 'fulfilled' },
    });
    (mockUseBFFSuccess as jest.Mock).mockReturnValue({
      data: {
        checkoutIntent: { adminPortalUrl: null },
      },
    });

    renderComponent();

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(window.location.href).toBe('');
  });

  it('applies correct CSS classes based on state', () => {
    (mockUsePolledCheckoutIntent as jest.Mock).mockReturnValue({
      data: { state: 'pending' },
    });
    (mockUseBFFSuccess as jest.Mock).mockReturnValue({ data: null });

    renderComponent();

    const button = screen.getByRole('button');
    expect(button).toHaveClass('mx-auto', 'd-block', 'w-auto', 'disabled-opacity');
  });

  it('has correct button type attribute', () => {
    (mockUsePolledCheckoutIntent as jest.Mock).mockReturnValue({ data: null });
    (mockUseBFFSuccess as jest.Mock).mockReturnValue({ data: null });

    renderComponent();

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'submit');
  });
});
