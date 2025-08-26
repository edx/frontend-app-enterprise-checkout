import { faker } from '@faker-js/faker';
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
  });

  describe('populateCompletedFormFields', () => {
    it('merges user details and intent details into the store while preserving existing fields', () => {
      const initialState = {
        formData: {
          [DataStoreKey.PlanDetails]: { quantity: 5 },
          [DataStoreKey.AccountDetails]: { enterpriseSlug: undefined, companyName: undefined },
          [DataStoreKey.BillingDetails]: { address1: '123 Main' },
        },
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

      populateCompletedFormFields({
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
      expect(computed.formData[DataStoreKey.BillingDetails]).toEqual({ address1: '123 Main' });
    });

    it('handles empty user, null intent and stripePriceId, setting authenticated=false and country=null', () => {
      const initialState = {
        formData: {
          [DataStoreKey.PlanDetails]: {},
          [DataStoreKey.AccountDetails]: {},
          [DataStoreKey.BillingDetails]: {},
        },
      } as any;

      const emptyUser = {} as any;

      populateCompletedFormFields({ checkoutIntent: null as any, authenticatedUser: emptyUser, stripePriceId: null });

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
  });
});
