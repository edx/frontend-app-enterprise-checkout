import { createQueryKeys, mergeQueryKeys } from '@lukemorales/query-key-factory';

import { fetchCheckoutIntent } from '@/components/app/data/services/checkout-intent';
import createCheckoutSession from '@/components/app/data/services/checkout-session';
import { fetchCheckoutContext, fetchCheckoutSuccess } from '@/components/app/data/services/context';
import createBillingPortalSession from '@/components/app/data/services/create-billing-portal';
import fetchCheckoutValidation from '@/components/app/data/services/validation';

const enterpriseCheckout = createQueryKeys('enterpriseCheckout', {
  bff: {
    queryKey: null,
    contextQueries: {
      context: (lmsUserId) => ({
        queryKey: [lmsUserId],
        queryFn: () => fetchCheckoutContext(),
      }),
      success: (lmsUserId) => ({
        queryKey: [lmsUserId],
        queryFn: () => fetchCheckoutSuccess(),
      }),
      validation: (fields, payload) => ({
        queryKey: [fields],
        queryFn: () => fetchCheckoutValidation(payload),
      }),
    },
  },
  createCheckoutSession: (fields, payload) => ({
    queryKey: [fields],
    queryFn: () => createCheckoutSession(payload),
  }),
  // CheckoutIntent lookup by UUID (preferred) or ID (legacy fallback).
  // UUID is preferred for security (IDs are sequential/guessable).
  // Detects UUID by checking if the identifier is a string containing '-'.
  checkoutIntent: (uuidOrId) => ({
    queryKey: [uuidOrId],
    queryFn: () => {
      const isUuid = typeof uuidOrId === 'string' && uuidOrId.includes('-');
      return fetchCheckoutIntent(isUuid ? { uuid: uuidOrId } : { id: uuidOrId });
    },
  }),
  createBillingPortalSession: (checkoutIntentId) => ({
    queryKey: [checkoutIntentId],
    queryFn: () => createBillingPortalSession(checkoutIntentId),
  }),
});

const queries = mergeQueryKeys(enterpriseCheckout);

export default queries;
