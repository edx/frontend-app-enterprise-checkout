import { queryOptions, useQuery } from '@tanstack/react-query';

import { queryBffContext } from '@/components/app/data/queries/queries';

const useBFFContext = () => useQuery(
  queryOptions({
    ...queryBffContext(),
  }),
);

export default useBFFContext;
