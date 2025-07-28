import { queryOptions, useQuery } from '@tanstack/react-query';

import { queryBffValidation } from '@/components/app/data/queries/queries';

const useBFFValidation = (formFields: ValidationSchema) => useQuery(
  queryOptions({
    ...queryBffValidation(formFields),
  }),
);
export default useBFFValidation;
