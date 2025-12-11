import * as authMod from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform/config';
import { logError, logInfo } from '@edx/frontend-platform/logging';
import { QueryClient } from '@tanstack/react-query';

import { makeRootLoader } from '@/components/app/routes/loaders';
import * as utilsMod from '@/components/app/routes/loaders/utils';
import { CheckoutPageRoute } from '@/constants/checkout';

// Mock redirect to avoid depending on global Response being present in Jest env
jest.mock('react-router-dom', () => ({
  redirect: (to: string) => ({
    status: 302,
    headers: { get: (name: string) => (name === 'Location' ? to : null) },
  }),
}));

// Mock logging to avoid relying on frontend-platform logging initialization
jest.mock('@edx/frontend-platform/logging', () => ({
  logError: jest.fn(),
  logInfo: jest.fn(),
}));

// Mock config to enable the self-service purchasing feature during tests
jest.mock('@edx/frontend-platform/config', () => ({
  getConfig: jest.fn(() => ({
    FEATURE_SELF_SERVICE_PURCHASING: true,
    FEATURE_SELF_SERVICE_PURCHASING_KEY: 'test-key',
  })),
}));

jest.mock('@edx/frontend-platform/auth', () => ({
  fetchAuthenticatedUser: jest.fn().mockResolvedValue(undefined),
  hydrateAuthenticatedUser: jest.fn().mockResolvedValue(undefined),
  getAuthenticatedUser: jest.fn(),
}));

jest.mock('@/components/app/routes/loaders/utils', () => ({
  determineExistingCheckoutIntentState: jest.fn(),
  populateInitialApplicationState: jest.fn(),
}));

jest.mock('@/utils/checkout', () => ({
  extractPriceId: jest.fn().mockReturnValue(null),
}));

describe('makeRootLoader (rootLoader) tests', () => {
  const makeRequest = (path: string) => ({ url: `http://localhost${path}` } as any);

  let queryClient: QueryClient;
  let ensureSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset feature flag session value between tests
    sessionStorage.clear();

    // Provide a safe default for determineExistingCheckoutIntentState to avoid undefined destructuring
    (utilsMod.determineExistingCheckoutIntentState as jest.Mock).mockReturnValue({
      existingSuccessfulCheckoutIntent: false,
      expiredCheckoutIntent: false,
    });

    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    ensureSpy = jest
      .spyOn(queryClient, 'ensureQueryData')
      .mockResolvedValue({ checkoutIntent: null } as any);
  });

  it('redirects unauthenticated users to Plan Details (and calls ensureQueryData first)', async () => {
    (authMod.getAuthenticatedUser as jest.Mock).mockReturnValue(null);

    const loader = makeRootLoader(queryClient);
    const result = await loader({ request: makeRequest('/account-details') } as any);

    expect(ensureSpy).toHaveBeenCalled();
    // Should be a redirect to Plan Details
    expect(result).not.toBeNull();
    const res = result as any;
    expect(res.status).toBe(302);
    expect(res.headers.get('Location')).toBe(CheckoutPageRoute.PlanDetails);
  });

  it('does not self-redirect unauthenticated users already on Plan Details', async () => {
    (authMod.getAuthenticatedUser as jest.Mock).mockReturnValue(null);

    const loader = makeRootLoader(queryClient);
    const result = await loader({ request: makeRequest(CheckoutPageRoute.PlanDetails) } as any);

    expect(result).toBeNull();
  });

  it('redirects to Billing Details Success when there is an existing successful checkout intent', async () => {
    const authenticatedUser = { email: 'a@b.com', name: 'Alice', username: 'alice', country: 'US' };
    (authMod.getAuthenticatedUser as jest.Mock).mockReturnValue(authenticatedUser);
    (utilsMod.determineExistingCheckoutIntentState as jest.Mock).mockReturnValue({
      existingSuccessfulCheckoutIntent: true,
      expiredCheckoutIntent: false,
    });
    ensureSpy.mockResolvedValue({ checkoutIntent: { state: 'paid' } } as any);

    const loader = makeRootLoader(queryClient);
    const result = await loader({ request: makeRequest(CheckoutPageRoute.PlanDetails) } as any);

    expect(utilsMod.populateInitialApplicationState).toHaveBeenCalledWith({
      checkoutIntent: { state: 'paid' },
      stripePriceId: null,
      authenticatedUser,
    });

    expect(result).not.toBeNull();
    const res = result as any;
    expect(res.status).toBe(302);
    expect(res.headers.get('Location')).toBe(CheckoutPageRoute.BillingDetailsSuccess);
  });

  it('does not self-redirect when already on Billing Details Success path', async () => {
    const authenticatedUser = { email: 'a@b.com', name: 'Alice', username: 'alice', country: 'US' };
    (authMod.getAuthenticatedUser as jest.Mock).mockReturnValue(authenticatedUser);
    (utilsMod.determineExistingCheckoutIntentState as jest.Mock).mockReturnValue({
      existingSuccessfulCheckoutIntent: true,
      expiredCheckoutIntent: false,
    });
    ensureSpy.mockResolvedValue({ checkoutIntent: { state: 'paid' } } as any);

    const loader = makeRootLoader(queryClient);
    const result = await loader({ request: makeRequest(CheckoutPageRoute.BillingDetailsSuccess) } as any);

    expect(result).toBeNull();
  });

  it('redirects to Plan Details when the checkout intent is expired', async () => {
    const authenticatedUser = { email: 'a@b.com', name: 'Alice', username: 'alice', country: 'US' };
    (authMod.getAuthenticatedUser as jest.Mock).mockReturnValue(authenticatedUser);
    (utilsMod.determineExistingCheckoutIntentState as jest.Mock).mockReturnValue({
      existingSuccessfulCheckoutIntent: false,
      expiredCheckoutIntent: true,
    });
    ensureSpy.mockResolvedValue({ checkoutIntent: { state: 'created' } } as any);

    const loader = makeRootLoader(queryClient);
    const result = await loader({ request: makeRequest(CheckoutPageRoute.BillingDetails) } as any);

    expect(utilsMod.populateInitialApplicationState).toHaveBeenCalledWith({
      checkoutIntent: { state: 'created' },
      stripePriceId: null,
      authenticatedUser,
    });

    expect(result).not.toBeNull();
    const res = result as any;
    expect(res.status).toBe(302);
    expect(res.headers.get('Location')).toBe(CheckoutPageRoute.PlanDetails);
  });

  it('returns null when authenticated and no successful/expired intent (in-progress), but still populates form fields', async () => {
    const authenticatedUser = { email: 'a@b.com', name: 'Alice', username: 'alice', country: 'US' };
    (authMod.getAuthenticatedUser as jest.Mock).mockReturnValue(authenticatedUser);
    (utilsMod.determineExistingCheckoutIntentState as jest.Mock).mockReturnValue({
      existingSuccessfulCheckoutIntent: false,
      expiredCheckoutIntent: false,
    });
    ensureSpy.mockResolvedValue({ checkoutIntent: { state: 'requires_payment' } } as any);

    const loader = makeRootLoader(queryClient);
    const result = await loader({ request: makeRequest(CheckoutPageRoute.BillingDetails) } as any);

    expect(utilsMod.populateInitialApplicationState).toHaveBeenCalledWith({
      checkoutIntent: { state: 'requires_payment' },
      stripePriceId: null,
      authenticatedUser,
    });
    expect(result).toBeNull();
  });

  it('feature flag: throws and logs an error when SSP is disabled and no feature key is provided', async () => {
    // Simulate feature flag disabled with known key
    (getConfig as jest.Mock).mockReturnValueOnce({
      FEATURE_SELF_SERVICE_PURCHASING: false,
      FEATURE_SELF_SERVICE_PURCHASING_KEY: 'test-key',
    });
    (authMod.getAuthenticatedUser as jest.Mock).mockReturnValue(null);

    const loader = makeRootLoader(queryClient);

    await expect(
      loader({ request: makeRequest(CheckoutPageRoute.PlanDetails) } as any),
    ).rejects.toThrow('Self-service purchasing is not enabled');

    expect(logError).toHaveBeenCalledWith('Self-service purchasing is not enabled');
  });

  it('feature flag: allows access when disabled but correct key is passed via URL and stores it in sessionStorage', async () => {
    (getConfig as jest.Mock).mockReturnValueOnce({
      FEATURE_SELF_SERVICE_PURCHASING: false,
      FEATURE_SELF_SERVICE_PURCHASING_KEY: 'test-key',
    });
    (authMod.getAuthenticatedUser as jest.Mock).mockReturnValue(null);

    const loader = makeRootLoader(queryClient);
    const result = await loader({
      request: makeRequest(`${CheckoutPageRoute.PlanDetails}?feature=test-key`),
    } as any);

    expect(logInfo).toHaveBeenCalled();
    expect(sessionStorage.getItem('self-service-purchasing')).toBe('test-key');
    // On Plan Details and unauthenticated → no redirect
    expect(result).toBeNull();
  });

  it('feature flag: proceeds without error when sessionStorage already has the correct key', async () => {
    sessionStorage.setItem('self-service-purchasing', 'test-key');
    (getConfig as jest.Mock).mockReturnValueOnce({
      FEATURE_SELF_SERVICE_PURCHASING: false,
      FEATURE_SELF_SERVICE_PURCHASING_KEY: 'test-key',
    });
    (authMod.getAuthenticatedUser as jest.Mock).mockReturnValue(null);

    const loader = makeRootLoader(queryClient);
    const result = await loader({ request: makeRequest(CheckoutPageRoute.PlanDetails) } as any);

    expect(logError).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });
});
