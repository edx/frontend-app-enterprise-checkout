import { createQueryKeys, mergeQueryKeys } from '@lukemorales/query-key-factory';

import createCheckoutSession from '@/components/app/data/services/checkout-session';
import { fetchCheckoutContext, fetchCheckoutSuccess } from '@/components/app/data/services/context';
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

const queries = mergeQueryKeys(enterpriseCheckout);

export default queries;
