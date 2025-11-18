import { snakeCaseObject } from '@edx/frontend-platform';

import {
  snakeCaseBaseValidation,
} from '@/components/app/data/constants';

import queries from './queryKeyFactory';

export const queryBffSuccess = (lmsUserId: number | null = null) => (
  queries
    .enterpriseCheckout
    .bff
    ._ctx.success(lmsUserId)
);

export const queryBffContext = (lmsUserId: number | null = null) => (
  queries
    .enterpriseCheckout
    .bff
    ._ctx.context(lmsUserId)
);

export const queryBffValidation = (payload: ValidationSchema) => {
  const fields = Object.keys(payload).sort();
  const snakeCasedPayload = snakeCaseObject({
    ...snakeCaseBaseValidation,
    ...payload,
  });
  return (
    queries
      .enterpriseCheckout
      .bff
      ._ctx.validation(fields, snakeCasedPayload)
  );
};

export const queryCheckoutIntent = (uuid: string) => (
  queries
    .enterpriseCheckout
    .checkoutIntent(uuid)
);

export const queryCreateBillingPortalSession = (checkoutIntentId?: number) => (
  queries
    .enterpriseCheckout
    .createBillingPortalSession(checkoutIntentId)
);
