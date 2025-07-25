import { snakeCaseObject } from '@edx/frontend-platform';

import queries from './queryKeyFactory';

export const queryBffContext = () => (queries
  .enterpriseCheckout
  .bff
  ._ctx
  .context
);

export const queryBffValidation = (payload: ValidationSchema) => {
  const fields = Object.keys(payload);
  const snakeCasedPayload = snakeCaseObject(payload);
  return queries
    .enterpriseCheckout
    .bff
    ._ctx
    .validation(fields, snakeCasedPayload);
};
