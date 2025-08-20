import dayjs from 'dayjs';

import { determineExistingCheckoutIntentState, populateCompletedFormFields } from '@/components/app/routes/loaders/utils';
import { DataStoreKey } from '@/constants/checkout';
import { checkoutFormStore } from '@/hooks/useCheckoutFormStore';

jest.mock('@/hooks/useCheckoutFormStore', () => ({
  checkoutFormStore: { setState: jest.fn() },
}));

// Helper types for test inputs (loosely typed to avoid coupling to app types)
type TestCheckoutIntent = {
  state: string;
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

    it('detects a successful and non-expired intent (paid)', () => {
      const intent: TestCheckoutIntent = {
        state: 'paid',
        expiresAt: dayjs().add(1, 'day').toISOString(),
      };
      const result = determineExistingCheckoutIntentState(intent as any);
      expect(result.existingSuccessfulCheckoutIntent).toBe(true);
      expect(result.expiredCheckoutIntent).toBe(false);
    });

    it('detects a successful but expired intent (fulfilled)', () => {
      const intent: TestCheckoutIntent = {
        state: 'fulfilled',
        expiresAt: dayjs().subtract(1, 'hour').toISOString(),
      };
      const result = determineExistingCheckoutIntentState(intent as any);
      expect(result.existingSuccessfulCheckoutIntent).toBe(true);
      expect(result.expiredCheckoutIntent).toBe(true);
    });

    it('detects an in-progress, non-expired intent (not successful)', () => {
      const intent: TestCheckoutIntent = {
        state: 'created',
        expiresAt: dayjs().add(2, 'hours').toISOString(),
      };
      const result = determineExistingCheckoutIntentState(intent as any);
      expect(result.existingSuccessfulCheckoutIntent).toBe(false);
      expect(result.expiredCheckoutIntent).toBe(false);
    });
  });

  describe('populateCompletedFormFields', () => {
    it('merges user details and intent details into the store while preserving existing fields', () => {
      const initialState = {
        formData: {
          [DataStoreKey.PlanDetails]: { quantity: 5, authenticated: false },
          [DataStoreKey.AccountDetails]: { enterpriseSlug: undefined, companyName: undefined },
          [DataStoreKey.BillingDetails]: { address1: '123 Main' },
        },
      } as any;

      const authenticatedUser = {
        email: 'boss@acme.com',
        name: 'Alice Boss',
        username: 'aboss',
        country: 'US',
      } as any;

      const checkoutIntent = {
        state: 'paid',
        expiresAt: dayjs().add(1, 'day').toISOString(),
        enterpriseSlug: 'acme',
        enterpriseName: 'Acme Inc',
      } satisfies TestCheckoutIntent;

      populateCompletedFormFields({ checkoutIntent: checkoutIntent as any, authenticatedUser });

      // Ensure setState called with updater fn and "false" (replace action behavior flag)
      expect((checkoutFormStore.setState as jest.Mock)).toHaveBeenCalled();
      const [updater, replaceFlag] = (checkoutFormStore.setState as jest.Mock).mock.calls[0];
      expect(typeof updater).toBe('function');
      expect(replaceFlag).toBe(false);

      const computed = updater(initialState);
      expect(computed.formData[DataStoreKey.PlanDetails]).toEqual(
        expect.objectContaining({
          quantity: 5, // preserved
          authenticated: true,
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
      expect(computed.formData[DataStoreKey.BillingDetails]).toEqual({ address1: '123 Main' });
    });

    it('handles empty user and null intent, setting authenticated=false and country=null', () => {
      const initialState = {
        formData: {
          [DataStoreKey.PlanDetails]: {},
          [DataStoreKey.AccountDetails]: {},
          [DataStoreKey.BillingDetails]: {},
        },
      } as any;

      const emptyUser = {} as any;

      populateCompletedFormFields({ checkoutIntent: null as any, authenticatedUser: emptyUser });

      expect((checkoutFormStore.setState as jest.Mock)).toHaveBeenCalled();
      const [updater] = (checkoutFormStore.setState as jest.Mock).mock.calls[0];
      const computed = updater(initialState);

      expect(computed.formData[DataStoreKey.PlanDetails]).toEqual(
        expect.objectContaining({
          authenticated: false,
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
  });
});
