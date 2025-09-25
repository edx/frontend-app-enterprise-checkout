import { createQueryKeys, mergeQueryKeys } from '@lukemorales/query-key-factory';

import createCheckoutSession from '@/components/app/data/services/checkout-session';
import { fetchCheckoutContext, fetchCheckoutSuccess } from '@/components/app/data/services/context';
import fetchCustomerPortalSession from '@/components/app/data/services/customerPortalSession';
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
});

const customerBilling = createQueryKeys('customerBilling', {
  portalSession: (lmsUserId) => ({
    queryKey: [lmsUserId],
    queryFn: () => fetchCustomerPortalSession(lmsUserId),
  }),
});

const queries = mergeQueryKeys(enterpriseCheckout, customerBilling);

export default queries;
