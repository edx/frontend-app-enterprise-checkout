import { faker } from '@faker-js/faker';
import dayjs from 'dayjs';

import { determineExistingCheckoutIntentState, mapCheckoutIntentStateToSessionStatus, populateInitialApplicationState, validateFormState } from '@/components/app/routes/loaders/utils';
import { CheckoutPageRoute, DataStoreKey } from '@/constants/checkout';
import { checkoutFormStore } from '@/hooks/useCheckoutFormStore';

jest.mock('@hookform/resolvers/zod', () => ({
  zodResolver: jest.fn(() => async (values: any) => {
    const errors: any = {};
    if ('adminEmail' in values || 'stripePriceId' in values || 'quantity' in values) {
      if (!values.adminEmail) { errors.adminEmail = { message: 'Required' }; }
      if (!values.stripePriceId) { errors.stripePriceId = { message: 'Required' }; }
    } else if ('enterpriseSlug' in values || 'companyName' in values) {
      if (!values.enterpriseSlug) { errors.enterpriseSlug = { message: 'Required' }; }
      if (!values.companyName) { errors.companyName = { message: 'Required' }; }
    }
    return { errors };
  }),
}));

jest.mock('@/hooks/useCheckoutFormStore', () => ({
  checkoutFormStore: { setState: jest.fn(), getState: jest.fn() },
}));
// Helper types for test inputs (loosely typed to avoid coupling to app types)
type TestCheckoutIntent = {
  state: string;
  quantity?: number;
  expiresAt?: string;
  enterpriseSlug?: string;
  enterpriseName?: string;
};

describe('utils.ts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('determineExistingCheckoutIntentState', () => {
    it('returns default flags when checkoutIntent is null', () => {
      const result = determineExistingCheckoutIntentState(null as any);
      expect(result).toEqual({
        existingSuccessfulCheckoutIntent: false,
        expiredCheckoutIntent: true,
      });
    });
  });

  describe('populateInitialApplicationState', () => {
    it('merges user details and intent details into the store while preserving existing fields', () => {
      const initialState = {
        formData: {
          [DataStoreKey.PlanDetails]: { quantity: 5 },
          [DataStoreKey.AccountDetails]: { enterpriseSlug: undefined, companyName: undefined },
          [DataStoreKey.BillingDetails]: {},
        },
        checkoutSessionStatus: {},
      } as any;

      const authenticatedUser: AuthenticatedUser = {
        email: 'boss@acme.com',
        name: 'Alice Boss',
        username: 'aboss',
        country: 'US',
      };

      const checkoutIntent = {
        state: 'paid',
        expiresAt: dayjs().add(1, 'day').toISOString(),
        enterpriseSlug: 'acme',
        enterpriseName: 'Acme Inc',
      } satisfies TestCheckoutIntent;

      const stripePriceId = faker.string.uuid();

      populateInitialApplicationState({
        checkoutIntent: checkoutIntent as CheckoutContextCheckoutIntent,
        authenticatedUser,
        stripePriceId,
      });

      // Ensure setState called with updater fn and "false" (replace action behavior flag)
      expect((checkoutFormStore.setState as jest.Mock)).toHaveBeenCalled();
      const [updater, replaceFlag] = (checkoutFormStore.setState as jest.Mock).mock.calls[0];
      expect(typeof updater).toBe('function');
      expect(replaceFlag).toBe(false);

      const computed = updater(initialState);
      expect(computed.formData[DataStoreKey.PlanDetails]).toEqual(
        expect.objectContaining({
          quantity: 5, // preserved
          fullName: 'Alice Boss',
          adminEmail: 'boss@acme.com',
          country: 'US',
        }),
      );
      expect(computed.formData[DataStoreKey.AccountDetails]).toEqual(
        expect.objectContaining({
          enterpriseSlug: 'acme',
          companyName: 'Acme Inc',
        }),
      );
      // Ensure other step data remain intact
      expect(computed.formData[DataStoreKey.BillingDetails]).toEqual({
        confirmTnC: false,
        confirmSubscription: false,
        confirmRecurringSubscription: false,
      });
    });

    it('handles empty user, null intent and stripePriceId, setting authenticated=false and country=null', () => {
      const initialState = {
        formData: {
          [DataStoreKey.PlanDetails]: {},
          [DataStoreKey.AccountDetails]: {},
          [DataStoreKey.BillingDetails]: {},
        },
        checkoutSessionStatus: {},
      } as any;

      const emptyUser = {} as any;

      populateInitialApplicationState({
        checkoutIntent: null as any,
        authenticatedUser: emptyUser,
        stripePriceId: null,
      });

      expect((checkoutFormStore.setState as jest.Mock)).toHaveBeenCalled();
      const [updater] = (checkoutFormStore.setState as jest.Mock).mock.calls[0];
      const computed = updater(initialState);

      expect(computed.formData[DataStoreKey.PlanDetails]).toEqual(
        expect.objectContaining({
          fullName: undefined,
          adminEmail: undefined,
          country: null,
        }),
      );
      expect(computed.formData[DataStoreKey.AccountDetails]).toEqual(
        expect.objectContaining({
          enterpriseSlug: undefined,
          companyName: undefined,
        }),
      );
    });

    it('uses quantity from checkoutIntent when no existing form data quantity exists', () => {
      const initialState = {
        formData: {
          [DataStoreKey.PlanDetails]: {}, // no quantity in existing form data
          [DataStoreKey.AccountDetails]: {},
          [DataStoreKey.BillingDetails]: {},
        },
        checkoutSessionStatus: {
          type: null,
          paymentStatus: null,
        },
      } as any;

      const authenticatedUser: AuthenticatedUser = {
        email: 'user@example.com',
        name: 'Test User',
        username: 'testuser',
        country: 'US',
      };

      const checkoutIntent = {
        state: 'created',
        quantity: 25, // quantity should come from here
        enterpriseSlug: 'test-company',
        enterpriseName: 'Test Company Inc',
      } satisfies TestCheckoutIntent;

      const stripePriceId = faker.string.uuid();

      populateInitialApplicationState({
        checkoutIntent: checkoutIntent as CheckoutContextCheckoutIntent,
        authenticatedUser,
        stripePriceId,
      });

      expect((checkoutFormStore.setState as jest.Mock)).toHaveBeenCalled();
      const [updater] = (checkoutFormStore.setState as jest.Mock).mock.calls[0];
      const computed = updater(initialState);

      expect(computed.formData[DataStoreKey.PlanDetails]).toEqual(
        expect.objectContaining({
          quantity: 25, // should come from checkoutIntent
          fullName: 'Test User',
          adminEmail: 'user@example.com',
          country: 'US',
        }),
      );
    });

    it('defaults quantity to null when neither form data nor checkoutIntent have quantity', () => {
      const initialState = {
        formData: {
          [DataStoreKey.PlanDetails]: {}, // no quantity in existing form data
          [DataStoreKey.AccountDetails]: {},
          [DataStoreKey.BillingDetails]: {},
        },
        checkoutSessionStatus: {
          type: null,
          paymentStatus: null,
        },
      } as any;

      const authenticatedUser: AuthenticatedUser = {
        email: 'user@example.com',
        name: 'Test User',
        username: 'testuser',
        country: 'US',
      };

      const checkoutIntent = {
        state: 'created',
        // no quantity in checkoutIntent
        enterpriseSlug: 'test-company',
        enterpriseName: 'Test Company Inc',
      } satisfies TestCheckoutIntent;

      const stripePriceId = faker.string.uuid();

      populateInitialApplicationState({
        checkoutIntent: checkoutIntent as CheckoutContextCheckoutIntent,
        authenticatedUser,
        stripePriceId,
      });

      expect((checkoutFormStore.setState as jest.Mock)).toHaveBeenCalled();
      const [updater] = (checkoutFormStore.setState as jest.Mock).mock.calls[0];
      const computed = updater(initialState);

      expect(computed.formData[DataStoreKey.PlanDetails]).toEqual(
        expect.objectContaining({
          quantity: null,
          fullName: 'Test User',
          adminEmail: 'user@example.com',
          country: 'US',
        }),
      );
    });
  });

  describe('mapCheckoutIntentStateToSessionStatus', () => {
    it('returns null type and paymentStatus when checkoutIntentState is undefined', () => {
      const result = mapCheckoutIntentStateToSessionStatus(undefined);
      expect(result).toEqual({
        type: null,
        paymentStatus: null,
      });
    });

    it('returns null type and paymentStatus when checkoutIntentState is null', () => {
      const result = mapCheckoutIntentStateToSessionStatus(null as any);
      expect(result).toEqual({
        type: null,
        paymentStatus: null,
      });
    });

    it('returns complete type and paid paymentStatus for "paid" state', () => {
      const result = mapCheckoutIntentStateToSessionStatus('paid' as any);
      expect(result).toEqual({
        type: 'complete',
        paymentStatus: 'paid',
      });
    });

    it('returns complete type and paid paymentStatus for "fulfilled" state', () => {
      const result = mapCheckoutIntentStateToSessionStatus('fulfilled' as any);
      expect(result).toEqual({
        type: 'complete',
        paymentStatus: 'paid',
      });
    });

    it('returns complete type and paid paymentStatus for "errored_provisioning" state', () => {
      const result = mapCheckoutIntentStateToSessionStatus('errored_provisioning' as any);
      expect(result).toEqual({
        type: 'complete',
        paymentStatus: 'paid',
      });
    });

    it('returns open type and null paymentStatus for other states', () => {
      const testStates = ['created', 'requires_payment', 'processing', 'cancelled'];

      testStates.forEach(state => {
        const result = mapCheckoutIntentStateToSessionStatus(state as any);
        expect(result).toEqual({
          type: 'open',
          paymentStatus: null,
        });
      });
    });
  });

  describe('validateFormState', () => {
    it('returns invalid with PlanDetails when constraints are null', async () => {
      (checkoutFormStore.getState as jest.Mock).mockReturnValue({ formData: {} });
      const result = await validateFormState({
        checkoutStep: 'AccountDetails',
        constraints: null as any,
        stripePriceId: 'price_123' as any,
      });
      expect(result).toEqual({ valid: false, invalidRoute: CheckoutPageRoute.PlanDetails });
    });

    it('returns invalidRoute=PlanDetails when PlanDetails validation fails for AccountDetails navigation', async () => {
      (checkoutFormStore.getState as jest.Mock).mockReturnValue({
        formData: {
          [DataStoreKey.PlanDetails]: {
            quantity: 1,
            adminEmail: '', // missing
            stripePriceId: '', // missing
          },
        },
      });
      const result = await validateFormState({
        checkoutStep: 'AccountDetails',
        constraints: {} as any,
        stripePriceId: 'price_123' as any,
      });
      expect(result).toEqual({ valid: false, invalidRoute: CheckoutPageRoute.PlanDetails });
    });

    it('returns invalidRoute=AccountDetails when AccountDetails fails for BillingDetails navigation', async () => {
      (checkoutFormStore.getState as jest.Mock).mockReturnValue({
        formData: {
          [DataStoreKey.PlanDetails]: {
            quantity: 1,
            adminEmail: 'user@example.com',
            stripePriceId: 'price_123',
          },
          [DataStoreKey.AccountDetails]: {
            enterpriseSlug: '', // missing
            companyName: '', // missing
          },
        },
      });
      const result = await validateFormState({
        checkoutStep: 'BillingDetails',
        constraints: {} as any,
        stripePriceId: 'price_123' as any,
      });
      expect(result).toEqual({ valid: false, invalidRoute: CheckoutPageRoute.AccountDetails });
    });

    it('returns valid=true when all prerequisite slices pass validation', async () => {
      (checkoutFormStore.getState as jest.Mock).mockReturnValue({
        formData: {
          [DataStoreKey.PlanDetails]: {
            quantity: 2,
            adminEmail: 'user@example.com',
            stripePriceId: 'price_123',
          },
          [DataStoreKey.AccountDetails]: {
            enterpriseSlug: 'acme',
            companyName: 'Acme Inc',
          },
        },
      });
      const result = await validateFormState({
        checkoutStep: 'BillingDetails',
        constraints: {} as any,
        stripePriceId: 'price_123' as any,
      });
      expect(result).toEqual({ valid: true });
    });
  });
});
