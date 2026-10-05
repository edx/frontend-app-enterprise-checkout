import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { getConfig } from '@edx/frontend-platform/config';
import { logError } from '@edx/frontend-platform/logging';

import type { CheckoutEventStep } from '@/constants/events';

/**
 * Helpers for the normalized checkout Segment events (ENT-12328).
 *
 * Every event is gated by FEATURE_SSP_CHECKOUT_SEGMENT_EVENTS_V2 and must never interrupt the
 * checkout: all storage access and emission is wrapped so failures (blocked storage, ad blockers,
 * Segment not loaded) are logged and swallowed.
 */

export const CHECKOUT_ATTRIBUTION_STORAGE_KEY = 'edx.checkout.attribution';
export const CHECKOUT_STARTED_STORAGE_KEY = 'edx.checkout.started';
export const CHECKOUT_PAYMENT_SUBMITTED_STORAGE_KEY = 'edx.checkout.payment_submitted';
const getBillingCompletedStorageKey = (checkoutIntentUuid: string) => `edx.checkout.billing_completed.${checkoutIntentUuid}`;

export const UTM_PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;

export type CheckoutAttributionProperties = Partial<Record<typeof UTM_PARAMS[number] | 'referrer', string>>;

export interface CheckoutProductProperties {
  product_id?: string;
  sku?: string;
  category: 'subscription';
  name: 'teams' | 'essentials';
  brand: 'enterprise';
  variant?: string;
  price?: number;
  slug?: string;
  payment_schedule?: string;
}

export interface CheckoutOrderProperties {
  order_id?: string;
  payment_method?: string;
  total_quantity?: number;
  revenue?: number;
}

export const isCheckoutEventsV2Enabled = (): boolean => {
  const { FEATURE_SSP_CHECKOUT_SEGMENT_EVENTS_V2 } = getConfig();
  return FEATURE_SSP_CHECKOUT_SEGMENT_EVENTS_V2 === true || FEATURE_SSP_CHECKOUT_SEGMENT_EVENTS_V2 === 'true';
};

/**
 * Removes properties that don't apply (undefined, null, empty string) so they are omitted
 * from the payload rather than sent as empty values.
 */
export const omitEmptyProperties = <T extends Record<string, unknown>>(properties: T): Partial<T> => (
  Object.fromEntries(
    Object.entries(properties).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  ) as Partial<T>
);

/**
 * Captures UTM parameters and the document referrer from the landing that begins checkout,
 * persisting them in sessionStorage so they survive step navigation and the logistration flow.
 *
 * The first capture in a session wins, unless a later landing carries its own UTM parameters
 * (i.e., the user arrived from a new campaign link).
 */
export const captureCheckoutAttribution = (url: string = window.location.href): void => {
  try {
    const { searchParams } = new URL(url);
    const utmProperties = omitEmptyProperties(
      Object.fromEntries(UTM_PARAMS.map((param) => [param, searchParams.get(param)])),
    );
    const hasUtmParams = Object.keys(utmProperties).length > 0;
    const hasStoredAttribution = sessionStorage.getItem(CHECKOUT_ATTRIBUTION_STORAGE_KEY) !== null;
    if (hasStoredAttribution && !hasUtmParams) {
      return;
    }
    const attribution: CheckoutAttributionProperties = omitEmptyProperties({
      ...utmProperties,
      referrer: document.referrer,
    });
    sessionStorage.setItem(CHECKOUT_ATTRIBUTION_STORAGE_KEY, JSON.stringify(attribution));
  } catch (error) {
    logError('Failed to capture checkout attribution', error);
  }
};

export const getCheckoutAttribution = (): CheckoutAttributionProperties => {
  try {
    const stored = sessionStorage.getItem(CHECKOUT_ATTRIBUTION_STORAGE_KEY);
    return stored ? omitEmptyProperties(JSON.parse(stored)) : {};
  } catch (error) {
    logError('Failed to read checkout attribution', error);
    return {};
  }
};

/**
 * Normalizes a Stripe recurring interval ('year', 'month', ...) into a payment schedule label.
 */
const toPaymentSchedule = (interval?: string | null): string | undefined => {
  if (!interval) { return undefined; }
  if (interval === 'day') { return 'daily'; }
  return `${interval}ly`;
};

interface BuildCheckoutProductPropertiesArgs {
  price: CheckoutContextPrice | null | undefined;
  isEssentials: boolean;
  academyName?: string | null;
  sspProductSlug?: string | null;
}

export const buildCheckoutProductProperties = ({
  price,
  isEssentials,
  academyName,
  sspProductSlug,
}: BuildCheckoutProductPropertiesArgs): CheckoutProductProperties => {
  const catalogQueryId = price?.catalogQueryId;
  return omitEmptyProperties({
    product_id: price?.product,
    sku: catalogQueryId != null ? String(catalogQueryId) : undefined,
    category: 'subscription',
    name: isEssentials ? 'essentials' : 'teams',
    brand: 'enterprise',
    // Variant (academy name) only applies to Essentials purchases.
    variant: isEssentials ? academyName?.trim() : undefined,
    price: price?.unitAmount != null ? price.unitAmount / 100 : undefined,
    slug: sspProductSlug || price?.sspProductSlug,
    payment_schedule: toPaymentSchedule(price?.recurring?.interval),
  }) as CheckoutProductProperties;
};

/**
 * Sends one of the normalized checkout events. No-op when the feature flag is disabled.
 * Emission is fire-and-forget: errors are logged, never surfaced to the user.
 */
export const sendCheckoutEvent = ({
  eventName,
  product,
  step,
  order,
}: {
  eventName: string;
  product: CheckoutProductProperties;
  step?: CheckoutEventStep;
  order?: CheckoutOrderProperties;
}): void => {
  if (!isCheckoutEventsV2Enabled()) {
    return;
  }
  try {
    sendTrackEvent(eventName, omitEmptyProperties({
      ...product,
      ...step,
      ...order,
      ...getCheckoutAttribution(),
    }));
  } catch (error) {
    logError(`Failed to send checkout event ${eventName}`, error);
  }
};

/**
 * Returns true only the first time it is called in a browser session, so `checkout_started`
 * does not re-fire when the user navigates back to step 1.
 */
export const claimCheckoutStarted = (): boolean => {
  try {
    if (sessionStorage.getItem(CHECKOUT_STARTED_STORAGE_KEY) === 'true') {
      return false;
    }
    sessionStorage.setItem(CHECKOUT_STARTED_STORAGE_KEY, 'true');
    return true;
  } catch (error) {
    logError('Failed to read checkout started state', error);
    return false;
  }
};

/**
 * Records that payment was submitted for a checkout intent in this tab. Stripe may redirect
 * the page to the success route after `confirm()`, so the success route uses this marker to
 * emit `checkout_step_completed.billing_details` for payments the in-page handler never saw.
 */
export const markCheckoutPaymentSubmitted = (checkoutIntentUuid?: string | null): void => {
  if (!checkoutIntentUuid) { return; }
  try {
    sessionStorage.setItem(CHECKOUT_PAYMENT_SUBMITTED_STORAGE_KEY, checkoutIntentUuid);
  } catch (error) {
    logError('Failed to record checkout payment submission', error);
  }
};

export const wasCheckoutPaymentSubmitted = (checkoutIntentUuid?: string | null): boolean => {
  if (!checkoutIntentUuid) { return false; }
  try {
    return sessionStorage.getItem(CHECKOUT_PAYMENT_SUBMITTED_STORAGE_KEY) === checkoutIntentUuid;
  } catch (error) {
    logError('Failed to read checkout payment submission', error);
    return false;
  }
};

/**
 * Returns true only the first time it is called for a checkout intent in this browser session,
 * so `checkout_step_completed.billing_details` is emitted once whether it comes from the
 * in-page payment handler or the success route after a Stripe redirect.
 */
export const claimBillingStepCompleted = (checkoutIntentUuid: string): boolean => {
  const storageKey = getBillingCompletedStorageKey(checkoutIntentUuid);
  try {
    if (sessionStorage.getItem(storageKey) === 'true') {
      return false;
    }
    sessionStorage.setItem(storageKey, 'true');
    return true;
  } catch (error) {
    logError('Failed to read billing step completed state', error);
    return false;
  }
};
