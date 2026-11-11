import { SegmentAnalyticsService } from '@edx/frontend-platform/analytics';

import { CheckoutSegmentAnalyticsService } from '@/utils/checkoutAnalyticsService';

// No GA/GTM on the page, as in checkout on stage and prod.
const mockSegment = ({ ready = true, userId = null }: { ready?: boolean; userId?: number | null } = {}) => {
  const analytics = {
    ready: jest.fn((callback: () => void) => { if (ready) { callback(); } }),
    user: jest.fn(() => ({ id: () => userId })),
    reset: jest.fn(),
    identify: jest.fn(),
    track: jest.fn(),
  };
  (window as any).analytics = analytics;
  return analytics;
};

// No SEGMENT_KEY, so the constructor doesn't inject analytics.js; mark Segment as loaded instead.
const createService = (ServiceClass: typeof SegmentAnalyticsService) => {
  const service = new ServiceClass({ config: {}, httpClient: {}, loggingService: { logError: jest.fn() } });
  service.segmentInitialized = true;
  return service;
};

describe('CheckoutSegmentAnalyticsService', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    delete (window as any).ga;
    delete (window as any).google_tag_manager;
  });

  afterEach(() => {
    jest.useRealTimers();
    delete (window as any).analytics;
  });

  it("frontend-platform's service drops anonymous events without GA/GTM (remove the override once this fails)", async () => {
    const analytics = mockSegment({ ready: false });
    const service = createService(SegmentAnalyticsService);

    const identified = service.identifyAnonymousUser();
    jest.advanceTimersByTime(2000);
    await identified;
    service.sendTrackEvent('edx.ui.enterprise.checkout.checkout_started', {});

    expect(analytics.track).not.toHaveBeenCalled();
  });

  it('sends anonymous events after the timeout without GA/GTM', async () => {
    const analytics = mockSegment({ ready: false });
    const service = createService(CheckoutSegmentAnalyticsService);

    const identified = service.identifyAnonymousUser();
    jest.advanceTimersByTime(2000);
    await identified;
    service.sendTrackEvent('edx.ui.enterprise.checkout.checkout_started', { name: 'teams' });

    expect(analytics.track).toHaveBeenCalledWith('edx.ui.enterprise.checkout.checkout_started', { name: 'teams' });
    expect(service.loggingService.logError).not.toHaveBeenCalled();
  });

  it('resolves once Segment is ready and resets a leftover user id', async () => {
    const analytics = mockSegment({ userId: 42 });
    const service = createService(CheckoutSegmentAnalyticsService);

    await service.identifyAnonymousUser();

    expect(analytics.reset).toHaveBeenCalled();
    expect(service.hasIdentifyBeenCalled).toBe(true);
  });

  it('identifies a user who logs in or registers in-app without a reload', async () => {
    const analytics = mockSegment({ ready: false });
    const service = createService(CheckoutSegmentAnalyticsService);

    const identified = service.identifyAnonymousUser();
    jest.advanceTimersByTime(2000);
    await identified;
    service.identifyAuthenticatedUser(123);
    service.sendTrackEvent('edx.ui.enterprise.checkout.signed_in', {});

    expect(analytics.identify).toHaveBeenCalledWith(123, undefined);
    expect(analytics.track).toHaveBeenCalledWith('edx.ui.enterprise.checkout.signed_in', {});
  });

  it('resets a leftover user id on the loaded SDK, not the snippet queue it replaced (cold start)', async () => {
    // frontend-platform's snippet queue: stubbed methods only, no user().
    const queuedReadyCallbacks: Array<() => void> = [];
    (window as any).analytics = { ready: jest.fn((callback: () => void) => { queuedReadyCallbacks.push(callback); }) };
    const service = createService(CheckoutSegmentAnalyticsService);

    const identified = service.identifyAnonymousUser();
    // analytics.js loads, replaces window.analytics, then runs the queued ready callbacks.
    const loadedSdk = mockSegment({ userId: 42 });
    queuedReadyCallbacks.forEach((callback) => callback());

    await expect(identified).resolves.toBeUndefined();
    expect(loadedSdk.reset).toHaveBeenCalled();
    expect(service.hasIdentifyBeenCalled).toBe(true);
  });

  it('resets a leftover user id at the timeout when the SDK has loaded but ready is still pending', async () => {
    const analytics = mockSegment({ ready: false, userId: 42 });
    const service = createService(CheckoutSegmentAnalyticsService);

    const identified = service.identifyAnonymousUser();
    jest.advanceTimersByTime(2000);
    await identified;

    expect(analytics.reset).toHaveBeenCalled();
  });

  it('keeps a user identified in-app when analytics.js finishes loading after the timeout', async () => {
    // analytics.js still loading at the timeout: window.analytics is the snippet's queue (no user()).
    const queuedReadyCallbacks: Array<() => void> = [];
    (window as any).analytics = {
      ready: jest.fn((callback: () => void) => { queuedReadyCallbacks.push(callback); }),
      identify: jest.fn(),
    };
    const service = createService(CheckoutSegmentAnalyticsService);

    const identified = service.identifyAnonymousUser();
    jest.advanceTimersByTime(2000);
    await identified;
    service.identifyAuthenticatedUser(123);
    // analytics.js loads with the signed-in user, then runs the late ready callback.
    const loadedSdk = mockSegment({ userId: 123 });
    queuedReadyCallbacks.forEach((callback) => callback());

    expect(loadedSdk.reset).not.toHaveBeenCalled();
  });

  it('resolves without waiting when analytics.js fails to load (e.g. ad blocker)', async () => {
    mockSegment({ ready: false });
    const service = createService(CheckoutSegmentAnalyticsService);

    const identified = service.identifyAnonymousUser();
    document.dispatchEvent(new Event('segmentFailed'));

    await expect(identified).resolves.toBeUndefined();
  });

  it('resolves immediately when Segment is not initialized', async () => {
    const analytics = mockSegment();
    const service = createService(CheckoutSegmentAnalyticsService);
    service.segmentInitialized = false;

    await service.identifyAnonymousUser();

    expect(analytics.ready).not.toHaveBeenCalled();
  });
});
