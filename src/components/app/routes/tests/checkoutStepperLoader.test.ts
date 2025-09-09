import * as authMod from '@edx/frontend-platform/auth';
import { QueryClient } from '@tanstack/react-query';

import { camelCasedCheckoutContextResponseFactory } from '@/components/app/data/services/__factories__';
import { makeCheckoutStepperLoader } from '@/components/app/routes/loaders';
import { CheckoutPageRoute, CheckoutStepKey, CheckoutSubstepKey, DataStoreKey } from '@/constants/checkout';
import { checkoutFormStore } from '@/hooks/useCheckoutFormStore';

// Avoid relying on Response implementation in Jest env
jest.mock('react-router-dom', () => ({
  redirect: (to: string) => ({
    status: 302,
    headers: { get: (name: string) => (name === 'Location' ? to : null) },
  }),
}));

// Auth controls
jest.mock('@edx/frontend-platform/auth', () => ({
  getAuthenticatedUser: jest.fn(),
}));

// Prevent network during schema validation superRefine
jest.mock('@/components/app/data/services/validation', () => ({
  validateFieldDetailed: jest.fn().mockResolvedValue({ isValid: true, validationDecisions: [] }),
}));

// Helpers to build args the loader expects
const makeReq = (path: string) => ({ url: `http://localhost${path}` } as any);
const makeLoaderArgs = (
  step?: CheckoutStepKey,
  substep?: CheckoutSubstepKey,
  path: string = '/',
) => ({ params: { step, substep }, request: makeReq(path) });

// Reset the checkout form store between tests
const resetFormStore = () => {
  checkoutFormStore.setState({
    formData: {
      [DataStoreKey.PlanDetails]: {},
      [DataStoreKey.AccountDetails]: {},
      [DataStoreKey.BillingDetails]: {},
    },
    setFormData: checkoutFormStore.getState().setFormData,
  }, false);
};

// Build a context object with optionally valid pricing (so extractPriceId returns something)
const buildContext = ({ withPrice = true }: { withPrice?: boolean } = {}) => {
  if (!withPrice) {
    return camelCasedCheckoutContextResponseFactory({
      pricing: { default_by_lookup_key: 'abc', prices: [] },
      checkout_intent: null,
    }) as any as CheckoutContextResponse;
  }
  const priceId = 'price_valid_123';
  const pricingOverride = {
    default_by_lookup_key: 'magic',
    prices: [
      { id: priceId, lookup_key: 'has-magic-inside' },
    ],
  };
  return camelCasedCheckoutContextResponseFactory({
    pricing: pricingOverride,
    checkout_intent: null,
  }) as any as CheckoutContextResponse;
};

// Populate store with valid data for AccountDetails/BillingDetails flows
const populateValidPlanDetails = (stripePriceId: string) => {
  checkoutFormStore.setState(s => ({
    ...s,
    formData: {
      ...s.formData,
      [DataStoreKey.PlanDetails]: {
        quantity: 10,
        fullName: 'Alice Example',
        adminEmail: 'alice@example.com',
        country: 'US',
        stripePriceId,
      },
    },
  }), false);
};

const populateValidAccountDetails = () => {
  checkoutFormStore.setState(s => ({
    ...s,
    formData: {
      ...s.formData,
      [DataStoreKey.AccountDetails]: {
        companyName: 'Good Co',
        enterpriseSlug: 'good-co',
      },
    },
  }), false);
};

const populateCheckoutSessionClientSecret = () => {
  checkoutFormStore.setState(s => ({
    ...s,
    checkoutSessionClientSecret: 'cs_test_123456',
  }), false);
};

describe('makeCheckoutStepperLoader (stepper loaders)', () => {
  let queryClient: QueryClient;
  let ensureSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    resetFormStore();

    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    ensureSpy = jest.spyOn(queryClient, 'ensureQueryData');
  });

  it('PlanDetails loader returns null', async () => {
    (authMod.getAuthenticatedUser as jest.Mock).mockReturnValue(null);
    const loader = makeCheckoutStepperLoader(queryClient);
    const result = await loader(
      makeLoaderArgs(CheckoutStepKey.PlanDetails, undefined, CheckoutPageRoute.PlanDetails),
    );
    expect(result).toBeNull();
  });

  it('PlanDetailsLogin redirects when authenticated, null otherwise', async () => {
    const loader = makeCheckoutStepperLoader(queryClient);

    (authMod.getAuthenticatedUser as jest.Mock).mockReturnValue(null);
    const r1 = await loader(
      makeLoaderArgs(CheckoutStepKey.PlanDetails, CheckoutSubstepKey.Login, CheckoutPageRoute.PlanDetailsLogin),
    );
    expect(r1).toBeNull();

    (authMod.getAuthenticatedUser as jest.Mock).mockReturnValue({ userId: 1 });
    const r2 = await loader(
      makeLoaderArgs(CheckoutStepKey.PlanDetails, CheckoutSubstepKey.Login, CheckoutPageRoute.PlanDetailsLogin),
    );
    expect(r2).not.toBeNull();
    expect((r2 as any).headers.get('Location')).toBe(CheckoutPageRoute.PlanDetails);
  });

  it('PlanDetailsRegister redirects when authenticated, null otherwise', async () => {
    const loader = makeCheckoutStepperLoader(queryClient);

    (authMod.getAuthenticatedUser as jest.Mock).mockReturnValue(null);
    const r1 = await loader(
      makeLoaderArgs(CheckoutStepKey.PlanDetails, CheckoutSubstepKey.Register, CheckoutPageRoute.PlanDetailsRegister),
    );
    expect(r1).toBeNull();

    (authMod.getAuthenticatedUser as jest.Mock).mockReturnValue({ userId: 1 });
    const r2 = await loader(
      makeLoaderArgs(CheckoutStepKey.PlanDetails, CheckoutSubstepKey.Register, CheckoutPageRoute.PlanDetailsRegister),
    );
    expect(r2).not.toBeNull();
    expect((r2 as any).headers.get('Location')).toBe(CheckoutPageRoute.PlanDetails);
  });

  describe('AccountDetails loader', () => {
    it('redirects unauthenticated users to Plan Details', async () => {
      (authMod.getAuthenticatedUser as jest.Mock).mockReturnValue(null);
      const loader = makeCheckoutStepperLoader(queryClient);
      const r = await loader(
        makeLoaderArgs(CheckoutStepKey.AccountDetails, undefined, CheckoutPageRoute.AccountDetails),
      );
      expect(r).not.toBeNull();
      expect((r as any).headers.get('Location')).toBe(CheckoutPageRoute.PlanDetails);
      expect(ensureSpy).not.toHaveBeenCalled();
    });

    it('redirects to Plan Details when no Stripe price id can be derived', async () => {
      (authMod.getAuthenticatedUser as jest.Mock).mockReturnValue({ userId: 1 });
      ensureSpy.mockResolvedValue(buildContext({ withPrice: false }));
      const loader = makeCheckoutStepperLoader(queryClient);
      const r = await loader(
        makeLoaderArgs(CheckoutStepKey.AccountDetails, undefined, CheckoutPageRoute.AccountDetails),
      );
      expect((r as any).headers.get('Location')).toBe(CheckoutPageRoute.PlanDetails);
    });

    it('redirects to Plan Details when prerequisite Plan Details form is invalid', async () => {
      (authMod.getAuthenticatedUser as jest.Mock).mockReturnValue({ userId: 1 });
      const ctx = buildContext({ withPrice: true });
      ensureSpy.mockResolvedValue(ctx);
      const loader = makeCheckoutStepperLoader(queryClient);
      const r = await loader(
        makeLoaderArgs(CheckoutStepKey.AccountDetails, undefined, CheckoutPageRoute.AccountDetails),
      );
      expect((r as any).headers.get('Location')).toBe(CheckoutPageRoute.PlanDetails);
    });

    it('returns null when prerequisites pass', async () => {
      (authMod.getAuthenticatedUser as jest.Mock).mockReturnValue({ userId: 1 });
      const ctx = buildContext({ withPrice: true });
      ensureSpy.mockResolvedValue(ctx);
      const { pricing } = ctx;
      const stripePriceId = pricing.prices[0].id as string;
      populateValidPlanDetails(stripePriceId);

      const loader = makeCheckoutStepperLoader(queryClient);
      const r = await loader(
        makeLoaderArgs(CheckoutStepKey.AccountDetails, undefined, CheckoutPageRoute.AccountDetails),
      );
      expect(r).toBeNull();
    });
  });

  describe('BillingDetails loader', () => {
    it('redirects unauthenticated users to Plan Details', async () => {
      (authMod.getAuthenticatedUser as jest.Mock).mockReturnValue(null);
      const loader = makeCheckoutStepperLoader(queryClient);
      const r = await loader(
        makeLoaderArgs(CheckoutStepKey.BillingDetails, undefined, CheckoutPageRoute.BillingDetails),
      );
      expect((r as any).headers.get('Location')).toBe(CheckoutPageRoute.PlanDetails);
    });

    it('redirects to Plan Details when no Stripe price id found', async () => {
      (authMod.getAuthenticatedUser as jest.Mock).mockReturnValue({ userId: 1 });
      ensureSpy.mockResolvedValue(buildContext({ withPrice: false }));
      const loader = makeCheckoutStepperLoader(queryClient);
      const r = await loader(
        makeLoaderArgs(CheckoutStepKey.BillingDetails, undefined, CheckoutPageRoute.BillingDetails),
      );
      expect((r as any).headers.get('Location')).toBe(CheckoutPageRoute.PlanDetails);
    });

    it('redirects to prerequisite page when form validation fails (Plan Details invalid)', async () => {
      (authMod.getAuthenticatedUser as jest.Mock).mockReturnValue({ userId: 1 });
      const ctx = buildContext({ withPrice: true });
      ensureSpy.mockResolvedValue(ctx);
      const loader = makeCheckoutStepperLoader(queryClient);
      const r = await loader(
        makeLoaderArgs(CheckoutStepKey.BillingDetails, undefined, CheckoutPageRoute.BillingDetails),
      );
      expect((r as any).headers.get('Location')).toBe(CheckoutPageRoute.PlanDetails);
    });

    it('redirects to Account Details when Plan Details valid but Account Details invalid', async () => {
      (authMod.getAuthenticatedUser as jest.Mock).mockReturnValue({ userId: 1 });
      const ctx = buildContext({ withPrice: true });
      ensureSpy.mockResolvedValue(ctx);
      const { pricing } = ctx;
      populateValidPlanDetails(pricing.prices[0].id as string);
      const loader = makeCheckoutStepperLoader(queryClient);
      const r = await loader(
        makeLoaderArgs(CheckoutStepKey.BillingDetails, undefined, CheckoutPageRoute.BillingDetails),
      );
      expect((r as any).headers.get('Location')).toBe(CheckoutPageRoute.AccountDetails);
    });

    it('redirects to Plan Details when checkout session is missing from state', async () => {
      (authMod.getAuthenticatedUser as jest.Mock).mockReturnValue({ userId: 1 });
      const ctx = buildContext({ withPrice: true });
      ensureSpy.mockResolvedValue(ctx);
      const { pricing } = ctx;
      const stripePriceId = pricing.prices[0].id as string;
      populateValidPlanDetails(stripePriceId);
      populateValidAccountDetails();

      const loader = makeCheckoutStepperLoader(queryClient);
      const r = await loader(
        makeLoaderArgs(CheckoutStepKey.BillingDetails, undefined, CheckoutPageRoute.BillingDetails),
      );
      expect((r as any).headers.get('Location')).toBe(CheckoutPageRoute.PlanDetails);
    });

    it('returns null after ensuring checkout session when everything is valid', async () => {
      (authMod.getAuthenticatedUser as jest.Mock).mockReturnValue({ userId: 1 });
      const ctx = buildContext({ withPrice: true });
      ensureSpy.mockResolvedValueOnce(ctx);
      const { pricing } = ctx;
      const stripePriceId = pricing.prices[0].id as string;
      populateValidPlanDetails(stripePriceId);
      populateValidAccountDetails();
      populateCheckoutSessionClientSecret();

      const loader = makeCheckoutStepperLoader(queryClient);
      const r = await loader(
        makeLoaderArgs(CheckoutStepKey.BillingDetails, undefined, CheckoutPageRoute.BillingDetails),
      );
      expect(r).toBeNull();
      expect(ensureSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('BillingDetailsSuccess loader', () => {
    it('redirects unauthenticated users to Plan Details', async () => {
      (authMod.getAuthenticatedUser as jest.Mock).mockReturnValue(null);
      const loader = makeCheckoutStepperLoader(queryClient);
      const r = await loader(
        makeLoaderArgs(
          CheckoutStepKey.BillingDetails,
          CheckoutSubstepKey.Success,
          CheckoutPageRoute.BillingDetailsSuccess,
        ),
      );
      expect((r as any).headers.get('Location')).toBe(CheckoutPageRoute.PlanDetails);
    });

    it('redirects to Plan Details when no Stripe price available', async () => {
      (authMod.getAuthenticatedUser as jest.Mock).mockReturnValue({ userId: 1 });
      ensureSpy.mockResolvedValue(buildContext({ withPrice: false }));
      const loader = makeCheckoutStepperLoader(queryClient);
      const r = await loader(
        makeLoaderArgs(
          CheckoutStepKey.BillingDetails,
          CheckoutSubstepKey.Success,
          CheckoutPageRoute.BillingDetailsSuccess,
        ),
      );
      expect((r as any).headers.get('Location')).toBe(CheckoutPageRoute.PlanDetails);
    });

    it('redirects to prerequisite route when forms invalid', async () => {
      (authMod.getAuthenticatedUser as jest.Mock).mockReturnValue({ userId: 1 });
      const ctx = buildContext({ withPrice: true });
      ensureSpy.mockResolvedValue(ctx);
      const loader = makeCheckoutStepperLoader(queryClient);
      const r = await loader(
        makeLoaderArgs(
          CheckoutStepKey.BillingDetails,
          CheckoutSubstepKey.Success,
          CheckoutPageRoute.BillingDetailsSuccess,
        ),
      );
      expect((r as any).headers.get('Location')).toBe(CheckoutPageRoute.PlanDetails);
    });

    it('returns null when prerequisites satisfied', async () => {
      (authMod.getAuthenticatedUser as jest.Mock).mockReturnValue({ userId: 1 });
      const ctx = buildContext({ withPrice: true });
      ensureSpy.mockResolvedValue(ctx);
      const { pricing } = ctx;
      populateValidPlanDetails(pricing.prices[0].id as string);
      populateValidAccountDetails();

      const loader = makeCheckoutStepperLoader(queryClient);
      const r = await loader(
        makeLoaderArgs(
          CheckoutStepKey.BillingDetails,
          CheckoutSubstepKey.Success,
          CheckoutPageRoute.BillingDetailsSuccess,
        ),
      );
      expect(r).toBeNull();
    });
  });

  it('returns null for unknown/invalid route (factory guards)', async () => {
    (authMod.getAuthenticatedUser as jest.Mock).mockReturnValue(null);
    const loader = makeCheckoutStepperLoader(queryClient);
    const r = await loader(
      { params: { step: 'not-a-real-step' } as any, request: makeReq('/not/a/real/path') },
    );
    expect(r).toBeNull();
  });
});
