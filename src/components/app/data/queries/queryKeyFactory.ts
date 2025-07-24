// eslint-disable-next-line import/no-extraneous-dependencies
import { createQueryKeys, mergeQueryKeys } from '@lukemorales/query-key-factory';

import { fetchCheckoutContext } from '@/components/app/data/services';

const enterpriseCheckout = createQueryKeys('enterpriseCheckout', {
  bff: {
    queryKey: null,
    contextQueries: {
      checkout: {
        queryKey: null,
        contextQueries: {
          checkout: {
            queryKey: null,
            queryFn: () => fetchCheckoutContext(),
          },
        },
      },
    },
  },

});

const queries = mergeQueryKeys(enterpriseCheckout);

export default queries;
