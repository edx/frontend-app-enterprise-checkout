import { snakeCaseObject } from '@edx/frontend-platform';

import {
  snakeCaseBaseCheckoutSession,
  snakeCaseBaseValidation,
} from '@/components/app/data/constants';

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
    ...snakeCaseBaseValidation,
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
    ...snakeCaseBaseCheckoutSession,
    ...payload,
  });
  return (
    queries
      .enterpriseCheckout
      .createCheckoutSession(fields, snakeCasedPayload)
  );
};
