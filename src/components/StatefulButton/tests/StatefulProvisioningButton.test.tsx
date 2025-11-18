import { fetchAuthenticatedUser } from '@edx/frontend-platform/auth';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

import { useBFFSuccess, usePolledAuthenticatedUser, usePolledCheckoutIntent } from '@/components/app/data';
import { StatefulProvisioningButton } from '@/components/StatefulButton';
import { sendEnterpriseCheckoutTrackingEvent } from '@/utils/common';
import { queryClient } from '@/utils/tests';

// Mock the data hooks
jest.mock('@/components/app/data', () => ({
  useBFFSuccess: jest.fn(),
  usePolledAuthenticatedUser: jest.fn(),
  usePolledCheckoutIntent: jest.fn(),
}));

jest.mock('@/utils/common', () => ({
  sendEnterpriseCheckoutTrackingEvent: jest.fn(),
}));

jest.mock('@edx/frontend-platform/auth', () => ({
  fetchAuthenticatedUser: jest.fn(),
}));

const mockUseBFFSuccess = useBFFSuccess as jest.MockedFunction<typeof useBFFSuccess>;
const mockUsePolledCheckoutIntent = usePolledCheckoutIntent as jest.MockedFunction<typeof usePolledCheckoutIntent>;
const mockUsePolledAuthenticatedUser = (
  usePolledAuthenticatedUser as jest.MockedFunction<typeof usePolledAuthenticatedUser>
);

// Mock window.location.href and window.open
const originalLocation = window.location;
const originalOpen = window.open;
beforeAll(() => {
  delete (window as any).location;
  window.location = { ...originalLocation, href: '' };
  window.open = jest.fn();
});

afterAll(() => {
  window.location = originalLocation;
  window.open = originalOpen!;
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
    {
      checkoutIntentState: 'paid',
      userIsActive: false,
      expectedButtonState: 'waiting',
      expectedHelpText: /check your email/,
    },
    {
      checkoutIntentState: 'paid',
      userIsActive: true,
      expectedButtonState: 'waiting',
      expectedHelpText: /wait while we provision/,
    },
    {
      checkoutIntentState: 'fulfilled',
      userIsActive: false,
      expectedButtonState: 'waiting',
      expectedHelpText: /check your email/,
    },
    {
      checkoutIntentState: 'fulfilled',
      userIsActive: true,
      expectedButtonState: 'success',
      expectedHelpText: /has been provisioned/i,
    },
    {
      checkoutIntentState: 'errored_provisioning',
      userIsActive: false,
      expectedButtonState: 'errored',
      expectedHelpText: /error while provisioning/i,
    },
    {
      checkoutIntentState: 'errored_provisioning',
      userIsActive: true,
      expectedButtonState: 'errored',
      expectedHelpText: /error while provisioning/i,
    },
    {
      checkoutIntentState: 'errored_fulfillment_stalled',
      userIsActive: false,
      expectedButtonState: 'errored',
      expectedHelpText: /error while provisioning/i,
    },
    {
      checkoutIntentState: 'errored_backoffice',
      userIsActive: false,
      expectedButtonState: 'errored',
      expectedHelpText: /error while provisioning/i,
    },
  ])('Validate button when checkoutIntent=$checkoutIntentState and user.isActive=$userIsActive', ({
    checkoutIntentState,
    userIsActive,
    expectedButtonState,
    expectedHelpText,
  }: {
    checkoutIntentState: CheckoutIntentState,
    userIsActive: boolean,
    expectedButtonState: 'waiting' | 'success' | 'errored',
    expectedHelpText: RegExp,
  }) => {
    (mockUsePolledCheckoutIntent as jest.Mock).mockReturnValue({
      data: { state: checkoutIntentState },
    });
    (mockUsePolledAuthenticatedUser as jest.Mock).mockReturnValue({
      polledAuthenticatedUser: {
        isActive: userIsActive,
      },
    });
    (mockUseBFFSuccess as jest.Mock).mockReturnValue({
      data: {
        checkoutIntent: {
          adminPortalUrl: checkoutIntentState === 'fulfilled' ? 'https://admin.example.com/test-enterprise' : null,
          state: checkoutIntentState,
        },
      },
      refetch: jest.fn().mockImplementation(() => ({ catch: jest.fn() })),
      isLoading: false,
    });

    renderComponent();
    validateText('Go to dashboard');
    const button = screen.queryByTestId('stateful-provisioning-button');
    const helpText = screen.queryByTestId('stateful-provisioning-button-help-text');
    expect(button).toHaveAttribute('data-button-state', expectedButtonState);
    expect(helpText).toBeInTheDocument();
    expect(helpText!.textContent).toMatch(expectedHelpText);
  });

  it('redirects to manager-learners URL with enterprise slug when success button is clicked', async () => {
    const user = userEvent.setup();
    const adminPortalUrl = 'https://admin.example.com/test-enterprise';
    const expectedButtonUrl = `${adminPortalUrl}/admin/subscriptions/manage-learners/`;

    (mockUsePolledCheckoutIntent as jest.Mock).mockReturnValue({
      data: { state: 'fulfilled' },
    });
    (mockUseBFFSuccess as jest.Mock).mockReturnValue({
      data: {
        checkoutIntent: {
          adminPortalUrl,
          state: 'fulfilled',
        },
      },
      refetch: jest.fn().mockImplementation(() => ({ catch: jest.fn() })),
      isLoading: false,
    });
    (mockUsePolledAuthenticatedUser as jest.Mock).mockReturnValue({
      polledAuthenticatedUser: {
        isActive: true,
      },
    });
    (fetchAuthenticatedUser as jest.Mock).mockResolvedValue({});

    renderComponent();

    const button = screen.getByRole('button');
    await user.click(button);

    expect(sendEnterpriseCheckoutTrackingEvent).toHaveBeenCalled();
    await waitFor(() => {
      expect(fetchAuthenticatedUser).toHaveBeenCalled();
    });
    expect(window.open).toHaveBeenCalledWith(expectedButtonUrl, '_blank', 'noopener,noreferrer');
  });
});
