import { createQueryKeys, mergeQueryKeys } from '@lukemorales/query-key-factory';

import createCheckoutSession from '@/components/app/data/services/checkout-session';
import fetchCheckoutContext from '@/components/app/data/services/context';
import fetchCheckoutValidation from '@/components/app/data/services/validation';

const enterpriseCheckout = createQueryKeys('enterpriseCheckout', {
  bff: {
    queryKey: null,
    contextQueries: {
      context: {
        queryKey: null,
        queryFn: () => fetchCheckoutContext(),
      },
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
