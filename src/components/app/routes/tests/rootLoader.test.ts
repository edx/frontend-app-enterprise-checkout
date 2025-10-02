import * as authMod from '@edx/frontend-platform/auth';
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

jest.mock('@edx/frontend-platform/auth', () => ({
  fetchAuthenticatedUser: jest.fn().mockResolvedValue(undefined),
  hydrateAuthenticatedUser: jest.fn().mockResolvedValue(undefined),
  getAuthenticatedUser: jest.fn(),
}));

jest.mock('@/components/app/routes/loaders/utils', () => ({
  determineExistingCheckoutIntentState: jest.fn(),
  populateCompletedFormFields: jest.fn(),
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
    const result = await loader({ request: makeRequest('/account-details') } as any);

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
    const result = await loader({ request: makeRequest('/billing-details') } as any);

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
    const result = await loader({ request: makeRequest('/billing-details') } as any);

    expect(utilsMod.populateInitialApplicationState).toHaveBeenCalledWith({
      checkoutIntent: { state: 'requires_payment' },
      stripePriceId: null,
      authenticatedUser,
    });
    expect(result).toBeNull();
  });
});
