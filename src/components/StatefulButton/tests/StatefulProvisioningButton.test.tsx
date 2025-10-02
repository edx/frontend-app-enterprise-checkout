import { IntlProvider } from '@edx/frontend-platform/i18n';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import { useBFFSuccess, usePolledCheckoutIntent } from '@/components/app/data';
import { StatefulProvisioningButton } from '@/components/StatefulButton';

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
  const renderComponent = () => render(
    <IntlProvider locale="en">
      <StatefulProvisioningButton />
    </IntlProvider>,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    window.location.href = '';
  });

  it('renders with pending state by default', () => {
    mockUsePolledCheckoutIntent.mockReturnValue({ data: null });
    mockUseBFFSuccess.mockReturnValue({ data: null });

    renderComponent();

    validateText('Creating your account');

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).toHaveClass('btn-secondary');
  });

  it('renders with success state when checkout intent is fulfilled', () => {
    mockUsePolledCheckoutIntent.mockReturnValue({
      data: { state: 'fulfilled' },
    });
    mockUseBFFSuccess.mockReturnValue({
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
    mockUsePolledCheckoutIntent.mockReturnValue({
      data: { state: 'errored_provisioning' },
    });
    mockUseBFFSuccess.mockReturnValue({ data: null });

    renderComponent();

    validateText('Error, try again.');

    const button = screen.getByRole('button');
    expect(button).not.toBeDisabled();
    expect(button).toHaveClass('btn-danger');
  });

  it('renders with error state when checkout intent has stripe error', () => {
    mockUsePolledCheckoutIntent.mockReturnValue({
      data: { state: 'errored_stripe_checkout' },
    });
    mockUseBFFSuccess.mockReturnValue({ data: null });

    renderComponent();

    validateText('Error, try again.');

    const button = screen.getByRole('button');
    expect(button).toHaveClass('btn-danger');
  });

  it('redirects to admin portal URL when success button is clicked', () => {
    const adminPortalUrl = 'https://admin.example.com/dashboard';

    mockUsePolledCheckoutIntent.mockReturnValue({
      data: { state: 'fulfilled' },
    });
    mockUseBFFSuccess.mockReturnValue({
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
    mockUsePolledCheckoutIntent.mockReturnValue({
      data: { state: 'fulfilled' },
    });
    mockUseBFFSuccess.mockReturnValue({
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
    mockUsePolledCheckoutIntent.mockReturnValue({
      data: { state: 'pending' },
    });
    mockUseBFFSuccess.mockReturnValue({ data: null });

    renderComponent();

    const button = screen.getByRole('button');
    expect(button).toHaveClass('mx-auto', 'd-block', 'w-auto', 'disabled-opacity');
  });

  it('has correct button type attribute', () => {
    mockUsePolledCheckoutIntent.mockReturnValue({ data: null });
    mockUseBFFSuccess.mockReturnValue({ data: null });

    renderComponent();

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'submit');
  });
});
