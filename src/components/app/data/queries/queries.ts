import { snakeCaseObject } from '@edx/frontend-platform';

import { baseCheckoutSession, baseValidation } from '@/components/app/data/constants';

import queries from './queryKeyFactory';

export const queryBffContext = () => (
  queries
    .enterpriseCheckout
    .bff
    ._ctx
    .context
);

export const queryBffValidation = (payload: ValidationSchema) => {
  const fields = Object.keys(payload);
  const snakeCasedPayload = snakeCaseObject({
    ...baseValidation,
    ...payload,
  });
  return (
    queries
      .enterpriseCheckout
      .bff
      ._ctx
      .validation(fields, snakeCasedPayload)
  );
};

export const queryCheckoutSession = (payload: CheckoutSessionSchema) => {
  const fields = Object.keys(payload);
  const snakeCasedPayload = snakeCaseObject({
    ...baseCheckoutSession,
    ...payload,
  });
  return (
    queries
      .enterpriseCheckout
      .createCheckoutSession(fields, snakeCasedPayload)
  );
};
