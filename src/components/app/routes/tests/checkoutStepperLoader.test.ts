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

const mapStep = (step?: string | CheckoutStepKey): CheckoutStepKey | undefined => {
  if (!step) { return undefined; }
  if (typeof step !== 'string') { return step; }
  switch (step) {
    case 'PlanDetails': return CheckoutStepKey.PlanDetails;
    case 'AccountDetails': return CheckoutStepKey.AccountDetails;
    case 'BillingDetails': return CheckoutStepKey.BillingDetails;
    default: return step as any;
  }
};
const mapSubstep = (sub?: string | CheckoutSubstepKey): CheckoutSubstepKey | undefined => {
  if (!sub) { return undefined; }
  if (typeof sub !== 'string') { return sub; }
  switch (sub) {
    case 'Login': return CheckoutSubstepKey.Login;
    case 'Register': return CheckoutSubstepKey.Register;
    case 'Success': return CheckoutSubstepKey.Success;
    default: return sub as any;
  }
};
const makeArgs = (
  step?: string | CheckoutStepKey,
  substep?: string | CheckoutSubstepKey,
  path: string = '/',
) => ({ params: { step: mapStep(step), substep: mapSubstep(substep) }, request: makeReq(path) });

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
const populateValidPlanDetails = (constraints: CheckoutContextFieldConstraints, stripePriceId: string) => {
  const minQty = constraints.quantity.min ?? 1;
  checkoutFormStore.setState(s => ({
    formData: {
      ...s.formData,
      [DataStoreKey.PlanDetails]: {
        quantity: minQty,
        fullName: 'Alice Example',
        adminEmail: 'alice@example.com',
        country: 'US',
        stripePriceId,
      },
    },
  }), false);
};

const populateValidAccountDetails = (constraints: CheckoutContextFieldConstraints) => {
  const minLen = constraints.enterpriseSlug.minLength ?? 3;
  const validSlug = 'abcde'.slice(0, Math.max(minLen, 3));
  checkoutFormStore.setState(s => ({
    formData: {
      ...s.formData,
      [DataStoreKey.AccountDetails]: {
        companyName: 'Good Co',
        enterpriseSlug: validSlug,
      },
    },
  }), false);
};

const populateValidBillingDetails = () => {
  checkoutFormStore.setState(s => ({
    formData: {
      ...s.formData,
      [DataStoreKey.BillingDetails]: {
        confirmTnC: true,
        confirmSubscription: true,
      },
    },
  }));
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
      makeArgs(CheckoutStepKey.PlanDetails, undefined, CheckoutPageRoute.PlanDetails),
    );
    expect(result).toBeNull();
  });

  it('PlanDetailsLogin redirects when authenticated, null otherwise', async () => {
    const loader = makeCheckoutStepperLoader(queryClient);

    (authMod.getAuthenticatedUser as jest.Mock).mockReturnValue(null);
    const r1 = await loader(
      makeArgs(CheckoutStepKey.PlanDetails, CheckoutSubstepKey.Login, CheckoutPageRoute.PlanDetailsLogin),
    );
    expect(r1).toBeNull();

    (authMod.getAuthenticatedUser as jest.Mock).mockReturnValue({ userId: 1 });
    const r2 = await loader(
      makeArgs(CheckoutStepKey.PlanDetails, CheckoutSubstepKey.Login, CheckoutPageRoute.PlanDetailsLogin),
    );
    expect(r2).not.toBeNull();
    expect((r2 as any).headers.get('Location')).toBe(CheckoutPageRoute.PlanDetails);
  });

  it('PlanDetailsRegister redirects when authenticated, null otherwise', async () => {
    const loader = makeCheckoutStepperLoader(queryClient);

    (authMod.getAuthenticatedUser as jest.Mock).mockReturnValue(null);
    const r1 = await loader(
      makeArgs(CheckoutStepKey.PlanDetails, CheckoutSubstepKey.Register, CheckoutPageRoute.PlanDetailsRegister),
    );
    expect(r1).toBeNull();

    (authMod.getAuthenticatedUser as jest.Mock).mockReturnValue({ userId: 1 });
    const r2 = await loader(
      makeArgs(CheckoutStepKey.PlanDetails, CheckoutSubstepKey.Register, CheckoutPageRoute.PlanDetailsRegister),
    );
    expect(r2).not.toBeNull();
    expect((r2 as any).headers.get('Location')).toBe(CheckoutPageRoute.PlanDetails);
  });

  describe('AccountDetails loader', () => {
    it('redirects unauthenticated users to Plan Details', async () => {
      (authMod.getAuthenticatedUser as jest.Mock).mockReturnValue(null);
      const loader = makeCheckoutStepperLoader(queryClient);
      const r = await loader(
        makeArgs(CheckoutStepKey.AccountDetails, undefined, CheckoutPageRoute.AccountDetails),
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
        makeArgs(CheckoutStepKey.AccountDetails, undefined, CheckoutPageRoute.AccountDetails),
      );
      expect((r as any).headers.get('Location')).toBe(CheckoutPageRoute.PlanDetails);
    });

    it('redirects to Plan Details when prerequisite Plan Details form is invalid', async () => {
      (authMod.getAuthenticatedUser as jest.Mock).mockReturnValue({ userId: 1 });
      const ctx = buildContext({ withPrice: true });
      ensureSpy.mockResolvedValue(ctx);
      const loader = makeCheckoutStepperLoader(queryClient);
      const r = await loader(
        makeArgs(CheckoutStepKey.AccountDetails, undefined, CheckoutPageRoute.AccountDetails),
      );
      expect((r as any).headers.get('Location')).toBe(CheckoutPageRoute.PlanDetails);
    });

    it('returns null when prerequisites pass', async () => {
      (authMod.getAuthenticatedUser as jest.Mock).mockReturnValue({ userId: 1 });
      const ctx = buildContext({ withPrice: true });
      ensureSpy.mockResolvedValue(ctx);
      const { fieldConstraints, pricing } = ctx;
      const stripePriceId = pricing.prices[0].id as string;
      populateValidPlanDetails(fieldConstraints, stripePriceId);

      const loader = makeCheckoutStepperLoader(queryClient);
      const r = await loader(
        makeArgs(CheckoutStepKey.AccountDetails, undefined, CheckoutPageRoute.AccountDetails),
      );
      expect(r).toBeNull();
    });
  });

  describe('BillingDetails loader', () => {
    it('redirects unauthenticated users to Plan Details', async () => {
      (authMod.getAuthenticatedUser as jest.Mock).mockReturnValue(null);
      const loader = makeCheckoutStepperLoader(queryClient);
      const r = await loader(
        makeArgs(CheckoutStepKey.BillingDetails, undefined, CheckoutPageRoute.BillingDetails),
      );
      expect((r as any).headers.get('Location')).toBe(CheckoutPageRoute.PlanDetails);
    });

    it('redirects to Plan Details when no Stripe price id found', async () => {
      (authMod.getAuthenticatedUser as jest.Mock).mockReturnValue({ userId: 1 });
      ensureSpy.mockResolvedValue(buildContext({ withPrice: false }));
      const loader = makeCheckoutStepperLoader(queryClient);
      const r = await loader(
        makeArgs(CheckoutStepKey.BillingDetails, undefined, CheckoutPageRoute.BillingDetails),
      );
      expect((r as any).headers.get('Location')).toBe(CheckoutPageRoute.PlanDetails);
    });

    it('redirects to prerequisite page when form validation fails (Plan Details invalid)', async () => {
      (authMod.getAuthenticatedUser as jest.Mock).mockReturnValue({ userId: 1 });
      const ctx = buildContext({ withPrice: true });
      ensureSpy.mockResolvedValue(ctx);
      const loader = makeCheckoutStepperLoader(queryClient);
      const r = await loader(
        makeArgs(CheckoutStepKey.BillingDetails, undefined, CheckoutPageRoute.BillingDetails),
      );
      expect((r as any).headers.get('Location')).toBe(CheckoutPageRoute.PlanDetails);
    });

    it('redirects to Account Details when Plan Details valid but Account Details invalid', async () => {
      (authMod.getAuthenticatedUser as jest.Mock).mockReturnValue({ userId: 1 });
      const ctx = buildContext({ withPrice: true });
      ensureSpy.mockResolvedValue(ctx);
      const { fieldConstraints, pricing } = ctx;
      populateValidPlanDetails(fieldConstraints, pricing.prices[0].id as string);
      const loader = makeCheckoutStepperLoader(queryClient);
      const r = await loader(
        makeArgs(CheckoutStepKey.BillingDetails, undefined, CheckoutPageRoute.BillingDetails),
      );
      expect((r as any).headers.get('Location')).toBe(CheckoutPageRoute.AccountDetails);
    });

    it('redirects to Plan Details when checkout session payload is invalid', async () => {
      (authMod.getAuthenticatedUser as jest.Mock).mockReturnValue({ userId: 1 });
      const ctx = buildContext({ withPrice: true });
      ensureSpy.mockResolvedValue(ctx);
      const { fieldConstraints, pricing } = ctx;
      const stripePriceId = pricing.prices[0].id as string;
      // Make plan/account mostly valid except leave one payload field empty (e.g., adminEmail)
      checkoutFormStore.setState(s => ({
        formData: {
          ...s.formData,
          [DataStoreKey.PlanDetails]: {
            quantity: fieldConstraints.quantity.min ?? 1,
            fullName: 'A',
            adminEmail: '',
            country: 'US',
            stripePriceId,
          },
          [DataStoreKey.AccountDetails]: {
            companyName: 'Good Co',
            enterpriseSlug: 'good-slug',
          },
        },
      }), false);

      const loader = makeCheckoutStepperLoader(queryClient);
      const r = await loader(
        makeArgs(CheckoutStepKey.BillingDetails, undefined, CheckoutPageRoute.BillingDetails),
      );
      expect((r as any).headers.get('Location')).toBe(CheckoutPageRoute.PlanDetails);
    });

    it('returns null after ensuring checkout session when everything is valid', async () => {
      (authMod.getAuthenticatedUser as jest.Mock).mockReturnValue({ userId: 1 });
      const ctx = buildContext({ withPrice: true });
      ensureSpy.mockResolvedValueOnce(ctx) // for context
        .mockResolvedValueOnce({ id: 'cs_test_123' }); // for checkout session

      const { fieldConstraints, pricing } = ctx;
      const stripePriceId = pricing.prices[0].id as string;
      populateValidPlanDetails(fieldConstraints, stripePriceId);
      populateValidAccountDetails(fieldConstraints);

      const loader = makeCheckoutStepperLoader(queryClient);
      const r = await loader(
        makeArgs(CheckoutStepKey.BillingDetails, undefined, CheckoutPageRoute.BillingDetails),
      );
      expect(r).toBeNull();
      expect(ensureSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('BillingDetailsSuccess loader', () => {
    it('redirects unauthenticated users to Plan Details', async () => {
      (authMod.getAuthenticatedUser as jest.Mock).mockReturnValue(null);
      const loader = makeCheckoutStepperLoader(queryClient);
      const r = await loader(
        makeArgs(CheckoutStepKey.BillingDetails, CheckoutSubstepKey.Success, CheckoutPageRoute.BillingDetailsSuccess),
      );
      expect((r as any).headers.get('Location')).toBe(CheckoutPageRoute.PlanDetails);
    });

    it('redirects to Plan Details when no Stripe price available', async () => {
      (authMod.getAuthenticatedUser as jest.Mock).mockReturnValue({ userId: 1 });
      ensureSpy.mockResolvedValue(buildContext({ withPrice: false }));
      const loader = makeCheckoutStepperLoader(queryClient);
      const r = await loader(
        makeArgs(CheckoutStepKey.BillingDetails, CheckoutSubstepKey.Success, CheckoutPageRoute.BillingDetailsSuccess),
      );
      expect((r as any).headers.get('Location')).toBe(CheckoutPageRoute.PlanDetails);
    });

    it('redirects to prerequisite route when forms invalid', async () => {
      (authMod.getAuthenticatedUser as jest.Mock).mockReturnValue({ userId: 1 });
      const ctx = buildContext({ withPrice: true });
      ensureSpy.mockResolvedValue(ctx);
      const loader = makeCheckoutStepperLoader(queryClient);
      const r = await loader(
        makeArgs(CheckoutStepKey.BillingDetails, CheckoutSubstepKey.Success, CheckoutPageRoute.BillingDetailsSuccess),
      );
      expect((r as any).headers.get('Location')).toBe(CheckoutPageRoute.PlanDetails);
    });

    it('returns null when prerequisites satisfied', async () => {
      (authMod.getAuthenticatedUser as jest.Mock).mockReturnValue({ userId: 1 });
      const ctx = buildContext({ withPrice: true });
      ensureSpy.mockResolvedValue(ctx);
      const { fieldConstraints, pricing } = ctx;
      populateValidPlanDetails(fieldConstraints, pricing.prices[0].id as string);
      populateValidAccountDetails(fieldConstraints);
      populateValidBillingDetails();

      const loader = makeCheckoutStepperLoader(queryClient);
      const r = await loader(
        makeArgs(CheckoutStepKey.BillingDetails, CheckoutSubstepKey.Success, CheckoutPageRoute.BillingDetailsSuccess),
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
