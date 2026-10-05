import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { getConfig } from '@edx/frontend-platform/config';

import { CHECKOUT_EVENT_STEPS } from '@/constants/events';
import {
  buildCheckoutProductProperties,
  captureCheckoutAttribution,
  CHECKOUT_ATTRIBUTION_STORAGE_KEY,
  claimCheckoutStarted,
  getCheckoutAttribution,
  omitEmptyProperties,
  sendCheckoutEvent,
} from '@/utils/checkoutEvents';

jest.mock('@edx/frontend-platform/analytics', () => ({
  sendTrackEvent: jest.fn(),
}));

jest.mock('@edx/frontend-platform/config', () => ({
  getConfig: jest.fn(),
}));

jest.mock('@edx/frontend-platform/logging', () => ({
  logError: jest.fn(),
}));

const mockPrice = {
  id: 'price_123',
  product: 'prod_abc',
  lookupKey: 'essentials_yearly',
  recurring: { internal: 'year', interval: 'year', intervalCount: 1 },
  sspProductSlug: 'ai-academy-yearly',
  currency: 'usd',
  unitAmount: 14900,
  unitAmountDecimal: '14900',
  catalogQueryId: 42,
} as CheckoutContextPrice;

const setReferrer = (value: string) => {
  Object.defineProperty(document, 'referrer', { value, configurable: true });
};

describe('checkoutEvents', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
    setReferrer('');
    (getConfig as jest.Mock).mockReturnValue({ FEATURE_SSP_CHECKOUT_SEGMENT_EVENTS_V2: 'true' });
  });

  describe('omitEmptyProperties', () => {
    it('drops undefined, null, and empty-string values but keeps falsy numbers', () => {
      expect(omitEmptyProperties({
        a: undefined, b: null, c: '', d: 0, e: 'x',
      })).toEqual({ d: 0, e: 'x' });
    });
  });

  describe('buildCheckoutProductProperties', () => {
    it('builds Essentials product properties including the academy variant', () => {
      expect(buildCheckoutProductProperties({
        price: mockPrice,
        isEssentials: true,
        academyName: ' AI Academy ',
        sspProductSlug: 'ai-academy-yearly',
      })).toEqual({
        product_id: 'prod_abc',
        sku: '42',
        category: 'subscription',
        name: 'essentials',
        brand: 'enterprise',
        variant: 'AI Academy',
        price: 149,
        slug: 'ai-academy-yearly',
        payment_schedule: 'yearly',
      });
    });

    it('omits variant for Teams and any properties that are unavailable', () => {
      expect(buildCheckoutProductProperties({
        price: { ...mockPrice, catalogQueryId: undefined, sspProductSlug: null },
        isEssentials: false,
        academyName: 'AI Academy',
        sspProductSlug: '',
      })).toEqual({
        product_id: 'prod_abc',
        category: 'subscription',
        name: 'teams',
        brand: 'enterprise',
        price: 149,
        payment_schedule: 'yearly',
      });
    });

    it('returns only the constant properties when pricing is missing', () => {
      expect(buildCheckoutProductProperties({ price: null, isEssentials: false })).toEqual({
        category: 'subscription',
        name: 'teams',
        brand: 'enterprise',
      });
    });
  });

  describe('attribution', () => {
    it('captures UTM params and referrer from the landing URL', () => {
      setReferrer('https://www.google.com/');
      captureCheckoutAttribution('http://localhost:1989/plan-details?utm_source=google&utm_medium=cpc&utm_campaign=teams_q3');
      expect(getCheckoutAttribution()).toEqual({
        utm_source: 'google',
        utm_medium: 'cpc',
        utm_campaign: 'teams_q3',
        referrer: 'https://www.google.com/',
      });
    });

    it('keeps the original attribution when later navigation has no UTM params', () => {
      captureCheckoutAttribution('http://localhost:1989/plan-details?utm_source=google');
      setReferrer('http://localhost:18000/login');
      captureCheckoutAttribution('http://localhost:1989/account-details');
      expect(getCheckoutAttribution()).toEqual({ utm_source: 'google' });
    });

    it('replaces attribution when a new campaign landing carries UTM params', () => {
      captureCheckoutAttribution('http://localhost:1989/plan-details?utm_source=google');
      captureCheckoutAttribution('http://localhost:1989/plan-details?utm_source=linkedin');
      expect(getCheckoutAttribution()).toEqual({ utm_source: 'linkedin' });
    });

    it('stores an empty attribution when there is no campaign context', () => {
      captureCheckoutAttribution('http://localhost:1989/plan-details');
      expect(sessionStorage.getItem(CHECKOUT_ATTRIBUTION_STORAGE_KEY)).toEqual('{}');
      expect(getCheckoutAttribution()).toEqual({});
    });
  });

  describe('claimCheckoutStarted', () => {
    it('returns true only once per session', () => {
      expect(claimCheckoutStarted()).toBe(true);
      expect(claimCheckoutStarted()).toBe(false);
    });
  });

  describe('sendCheckoutEvent', () => {
    const product = buildCheckoutProductProperties({ price: mockPrice, isEssentials: false });

    it('sends product, step, order, and attribution properties', () => {
      captureCheckoutAttribution('http://localhost:1989/plan-details?utm_source=google');
      sendCheckoutEvent({
        eventName: 'test.event',
        product,
        step: CHECKOUT_EVENT_STEPS.BILLING_DETAILS,
        order: { order_id: 'cs_123', total_quantity: 5, revenue: 745 },
      });
      expect(sendTrackEvent).toHaveBeenCalledWith('test.event', {
        ...product,
        step_name: 'Billing Details',
        step_number: 3,
        order_id: 'cs_123',
        total_quantity: 5,
        revenue: 745,
        utm_source: 'google',
      });
    });

    it('does nothing when the feature flag is disabled', () => {
      (getConfig as jest.Mock).mockReturnValue({ FEATURE_SSP_CHECKOUT_SEGMENT_EVENTS_V2: null });
      sendCheckoutEvent({ eventName: 'test.event', product });
      expect(sendTrackEvent).not.toHaveBeenCalled();
    });

    it('never throws when Segment emission fails', () => {
      (sendTrackEvent as jest.Mock).mockImplementation(() => { throw new Error('blocked'); });
      expect(() => sendCheckoutEvent({ eventName: 'test.event', product })).not.toThrow();
    });
  });
});
