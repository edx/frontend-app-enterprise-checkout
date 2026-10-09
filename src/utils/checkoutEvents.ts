import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { getConfig } from '@edx/frontend-platform/config';
import { logError } from '@edx/frontend-platform/logging';

import { PLAN_TYPE } from '@/constants/events';

import type { CheckoutEventStep } from '@/constants/events';

// Helpers for the checkout Segment events (ENT-12328). Tracking must never interrupt checkout,
// so storage and emission failures are logged and swallowed.

export const CHECKOUT_ATTRIBUTION_STORAGE_KEY = 'edx.checkout.attribution';
export const CHECKOUT_STARTED_STORAGE_KEY = 'edx.checkout.started';
const UTM_PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;

type CheckoutAttributionProperties = Partial<Record<typeof UTM_PARAMS[number] | 'referrer', string>>;

export interface CheckoutProductProperties {
  product_id?: string;
  sku?: number;
  category: 'subscription';
  name: 'teams' | 'essentials';
  brand: 'enterprise';
  variant?: string;
  price?: number;
  slug?: string;
  payment_schedule: 'yearly';
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

/** Drops undefined, null and empty-string values so they are omitted, not sent empty. */
export const omitEmptyProperties = <T extends Record<string, unknown>>(properties: T): Partial<T> => (
  Object.fromEntries(
    Object.entries(properties).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  ) as Partial<T>
);

/** Stores UTM params and referrer from the checkout landing; a later URL with UTMs replaces them. */
export const captureCheckoutAttribution = (url: string = window.location.href): void => {
  try {
    const { searchParams } = new URL(url);
    const utmProperties = omitEmptyProperties(
      Object.fromEntries(UTM_PARAMS.map((param) => [param, searchParams.get(param)])),
    );
    const hasUtmParams = Object.keys(utmProperties).length > 0;
    if (sessionStorage.getItem(CHECKOUT_ATTRIBUTION_STORAGE_KEY) !== null && !hasUtmParams) {
      return;
    }
    const attribution = omitEmptyProperties({ ...utmProperties, referrer: document.referrer });
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

/** Maps the selected price and SSP product to event product properties; "academy" slugs are Essentials. */
export const buildCheckoutProductProperties = ({
  price,
  selectedProduct,
}: {
  price: CheckoutContextPrice | null | undefined;
  selectedProduct?: { name?: string } | null;
}): CheckoutProductProperties => {
  const slug = price?.sspProductSlug;
  return omitEmptyProperties({
    product_id: price?.product,
    sku: price?.catalogQueryId,
    category: 'subscription',
    name: slug?.includes('academy') ? PLAN_TYPE.ESSENTIALS : PLAN_TYPE.TEAMS,
    brand: 'enterprise',
    variant: selectedProduct?.name?.trim(),
    price: price?.unitAmount != null ? price.unitAmount / 100 : undefined,
    slug,
    // Only yearly plans are sold today.
    payment_schedule: 'yearly',
  }) as CheckoutProductProperties;
};

/** Sends a checkout event. No-op when the flag is off; never throws. */
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
      ...product, ...step, ...order, ...getCheckoutAttribution(),
    }));
  } catch (error) {
    logError(`Failed to send checkout event ${eventName}`, error);
  }
};

/** True only on the first call in a browser session, so checkout_started fires once. */
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
