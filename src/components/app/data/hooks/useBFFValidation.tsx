import { queryOptions, useQuery } from '@tanstack/react-query';

import { queryBffValidation } from '@/components/app/data/queries/queries';

/**
 * React hook: Performs server-side form field validation using the BFF validation endpoint.
 *
 * @param {ValidationSchema} formFields - The validation request payload to be sent to the server.
 *   Keys should match the client schema; they are snake-cased before being sent.
 * @returns A TanStack Query result whose `data` is the server validation response.
 */
const useBFFValidation = (formFields: ValidationSchema) => useQuery(
  queryOptions({
    ...queryBffValidation(formFields),
  }),
);
export default useBFFValidation;
