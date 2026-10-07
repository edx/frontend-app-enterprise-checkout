import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { getConfig } from '@edx/frontend-platform/config';
import { logError } from '@edx/frontend-platform/logging';

import { CHECKOUT_EVENT_STEPS } from '@/constants/events';
import {
  buildCheckoutProductProperties,
  captureCheckoutAttribution,
  claimCheckoutStarted,
  getCheckoutAttribution,
  omitEmptyProperties,
  sendCheckoutEvent,
} from '@/utils/checkoutEvents';

jest.mock('@edx/frontend-platform/analytics', () => ({ sendTrackEvent: jest.fn() }));
jest.mock('@edx/frontend-platform/config', () => ({ getConfig: jest.fn() }));
jest.mock('@edx/frontend-platform/logging', () => ({ logError: jest.fn() }));

const mockPrice = {
  product: 'prod_abc',
  sspProductSlug: 'ai-academy-yearly',
  unitAmount: 14900,
  catalogQueryId: 42,
} as CheckoutContextPrice;
const LANDING = 'http://localhost:1989/plan-details';
const setReferrer = (value: string) => Object.defineProperty(document, 'referrer', { value, configurable: true });

describe('checkoutEvents', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
    setReferrer('');
    (getConfig as jest.Mock).mockReturnValue({ FEATURE_SSP_CHECKOUT_SEGMENT_EVENTS_V2: 'true' });
  });

  it('omitEmptyProperties drops undefined, null and empty strings but keeps 0', () => {
    expect(omitEmptyProperties({
      a: undefined, b: null, c: '', d: 0, e: 'x',
    })).toEqual({ d: 0, e: 'x' });
  });

  describe('buildCheckoutProductProperties', () => {
    it('builds Essentials properties for an academy slug, with the selected product name as the variant', () => {
      const selectedProduct = { name: ' AI Academy ' };
      expect(buildCheckoutProductProperties({ price: mockPrice, selectedProduct }))
        .toEqual({
          product_id: 'prod_abc',
          sku: 42,
          category: 'subscription',
          name: 'essentials',
          brand: 'enterprise',
          variant: 'AI Academy',
          price: 149,
          slug: 'ai-academy-yearly',
          payment_schedule: 'yearly',
        });
    });

    it('builds Teams properties for a non-academy slug, or no slug, without a variant', () => {
      expect(buildCheckoutProductProperties({ price: { sspProductSlug: 'teams_yearly' } as CheckoutContextPrice }))
        .toEqual({
          category: 'subscription', name: 'teams', brand: 'enterprise', slug: 'teams_yearly', payment_schedule: 'yearly',
        });
      expect(buildCheckoutProductProperties({ price: null }))
        .toEqual({
          category: 'subscription', name: 'teams', brand: 'enterprise', payment_schedule: 'yearly',
        });
    });
  });

  describe('attribution', () => {
    it('captures UTM params and the referrer from the landing URL', () => {
      setReferrer('https://www.google.com/');
      captureCheckoutAttribution(`${LANDING}?utm_source=google&utm_medium=cpc&utm_campaign=teams_q3`);
      expect(getCheckoutAttribution()).toEqual({
        utm_source: 'google', utm_medium: 'cpc', utm_campaign: 'teams_q3', referrer: 'https://www.google.com/',
      });
    });

    it('keeps the first capture unless a later URL carries its own UTM params', () => {
      captureCheckoutAttribution(`${LANDING}?utm_source=google`);
      captureCheckoutAttribution('http://localhost:1989/account-details');
      expect(getCheckoutAttribution()).toEqual({ utm_source: 'google' });
      captureCheckoutAttribution(`${LANDING}?utm_source=linkedin`);
      expect(getCheckoutAttribution()).toEqual({ utm_source: 'linkedin' });
    });

    it('returns no attribution when there is no campaign context', () => {
      captureCheckoutAttribution(LANDING);
      expect(getCheckoutAttribution()).toEqual({});
    });
  });

  it('claimCheckoutStarted returns true only once per session', () => {
    expect(claimCheckoutStarted()).toBe(true);
    expect(claimCheckoutStarted()).toBe(false);
  });

  describe('when sessionStorage is unavailable (e.g. private browsing or quota exceeded)', () => {
    const storageError = new Error('storage blocked');
    let storageSpies: jest.SpyInstance[];

    beforeEach(() => {
      storageSpies = [
        jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw storageError; }),
        jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw storageError; }),
      ];
    });

    afterEach(() => {
      storageSpies.forEach((spy) => spy.mockRestore());
    });

    it('captureCheckoutAttribution logs and does not throw', () => {
      expect(() => captureCheckoutAttribution(`${LANDING}?utm_source=google`)).not.toThrow();
      expect(logError).toHaveBeenCalledWith('Failed to capture checkout attribution', storageError);
    });

    it('getCheckoutAttribution logs and returns no attribution', () => {
      expect(getCheckoutAttribution()).toEqual({});
      expect(logError).toHaveBeenCalledWith('Failed to read checkout attribution', storageError);
    });

    it('claimCheckoutStarted logs and returns false', () => {
      expect(claimCheckoutStarted()).toBe(false);
      expect(logError).toHaveBeenCalledWith('Failed to read checkout started state', storageError);
    });
  });

  describe('sendCheckoutEvent', () => {
    const product = buildCheckoutProductProperties({ price: mockPrice });

    it('sends product, step, order and attribution properties', () => {
      captureCheckoutAttribution(`${LANDING}?utm_source=google`);
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
      (getConfig as jest.Mock).mockReturnValue({});
      sendCheckoutEvent({ eventName: 'test.event', product });
      expect(sendTrackEvent).not.toHaveBeenCalled();
    });

    it('never throws when Segment emission fails', () => {
      (sendTrackEvent as jest.Mock).mockImplementation(() => { throw new Error('blocked'); });
      expect(() => sendCheckoutEvent({ eventName: 'test.event', product })).not.toThrow();
    });
  });
});
