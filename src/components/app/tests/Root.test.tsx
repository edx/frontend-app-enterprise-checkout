import { IntlProvider } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

import Root from '@/components/app/Root';
import { CheckoutStepKey } from '@/constants/checkout';
import { queryClient, renderWithRouterProvider } from '@/utils/tests';

import { getRoutes } from '../../../routes';

jest.mock('@/components/app/data/hooks/useNProgressController', () => ({
  useNProgressController: jest.fn(),
}));

jest.mock('@edx/frontend-platform/analytics', () => ({
  sendPageEvent: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  ScrollRestoration: jest.fn().mockImplementation(() => <div data-testid="scroll-restoration" />),
  Outlet: jest.fn().mockImplementation(() => <div data-testid="outlet" />),
}));

const defaultAppContextValue = {
  config: {},
  authenticatedUser: null,
};

const RootWrapper = ({
  appContextValue = defaultAppContextValue,
}) => (
  <IntlProvider locale="en">
    <QueryClientProvider client={queryClient()}>
      <AppContext.Provider value={appContextValue}>
        <Root />
      </AppContext.Provider>
    </QueryClientProvider>
  </IntlProvider>
);

describe('Root tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders child routes (Outlet) and ScrollRestoration', async () => {
    const { routes } = getRoutes(queryClient());

    renderWithRouterProvider(<RootWrapper />, {
      initialEntries: [`/${CheckoutStepKey.PlanDetails}`],
      routes,
    });

    await waitFor(() => {
      expect(screen.getByTestId('scroll-restoration')).toBeInTheDocument();
      expect(screen.getByTestId('outlet')).toBeInTheDocument();
    });
  });
});
