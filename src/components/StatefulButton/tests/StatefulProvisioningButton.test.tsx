import { IntlProvider } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

import { useBFFSuccess, usePolledCheckoutIntent } from '@/components/app/data';
import { StatefulProvisioningButton } from '@/components/StatefulButton';
import { sendEnterpriseCheckoutTrackingEvent } from '@/utils/common';
import { queryClient } from '@/utils/tests';

// Mock the data hooks
jest.mock('@/components/app/data', () => ({
  useBFFSuccess: jest.fn(),
  usePolledCheckoutIntent: jest.fn(),
}));

jest.mock('@/utils/common', () => ({
  sendEnterpriseCheckoutTrackingEvent: jest.fn(),
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
    (mockUseBFFSuccess as jest.Mock).mockReturnValue({
      data: null,
      refetch: jest.fn().mockImplementation(() => ({ catch: jest.fn() })),
    });
    window.location.href = '';
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

  it.each([
    'paid',
    'errored_provisioning',
    'errored_stripe_checkout',
    'fulfilled',
  ])('button does not render except on fulfilled checkout intent state', (state) => {
    (mockUsePolledCheckoutIntent as jest.Mock).mockReturnValue({ data: { state } });
    (mockUseBFFSuccess as jest.Mock).mockReturnValue({
      data: {
        checkoutIntent: { adminPortalUrl: state === 'fulfilled' ? 'https://admin.example.com' : null },
      },
      refetch: jest.fn().mockImplementation(() => ({ catch: jest.fn() })),
      isLoading: false,
    });

    renderComponent();
    const button = screen.queryByTestId('stateful-provisioning-button');
    if (state !== 'fulfilled') {
      expect(button).toBeNull();
    } else {
      expect(button).toBeTruthy();
    }
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

  it('redirects to admin portal URL when success button is clicked', async () => {
    const user = userEvent.setup();
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
    await user.click(button);

    expect(sendEnterpriseCheckoutTrackingEvent).toHaveBeenCalled();
    expect(window.location.href).toBe(adminPortalUrl);
  });
});
