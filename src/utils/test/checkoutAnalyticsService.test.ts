import { SegmentAnalyticsService } from '@edx/frontend-platform/analytics';

import { CheckoutSegmentAnalyticsService } from '@/utils/checkoutAnalyticsService';

// The loaded analytics.js SDK. No GA/GTM on the page, as in checkout on stage and prod. Like the real
// SDK, identify sets the user id, reset clears it, and every call records the id it was sent with.
const mockSegment = ({ ready = true, userId = null }: { ready?: boolean; userId?: number | null } = {}) => {
  let currentUserId = userId;
  const sent: Array<{ method: string; name?: string; userId: number | null }> = [];
  const analytics = {
    ready: jest.fn((callback: () => void) => { if (ready) { callback(); } }),
    user: jest.fn(() => ({ id: () => currentUserId })),
    reset: jest.fn(() => { currentUserId = null; sent.push({ method: 'reset', userId: null }); }),
    identify: jest.fn((id: number) => { currentUserId = id; sent.push({ method: 'identify', userId: id }); }),
    track: jest.fn((name: string) => { sent.push({ method: 'track', name, userId: currentUserId }); }),
    page: jest.fn((_category: string, name: string) => { sent.push({ method: 'page', name, userId: currentUserId }); }),
    sent,
  };
  (window as any).analytics = analytics;
  return analytics;
};

// frontend-platform's snippet queue while analytics.js loads: stubbed methods only, no user().
// Returns a function that simulates analytics.js loading: it replaces window.analytics with the
// SDK and runs the queued ready callbacks.
const mockSnippetQueue = () => {
  const queuedReadyCallbacks: Array<() => void> = [];
  const queue = {
    ready: jest.fn((callback: () => void) => { queuedReadyCallbacks.push(callback); }),
    identify: jest.fn(),
    track: jest.fn(),
    page: jest.fn(),
  };
  (window as any).analytics = queue;
  const loadSdk = (sdkOptions: { userId?: number | null } = {}) => {
    const sdk = mockSegment({ ready: false, ...sdkOptions });
    queuedReadyCallbacks.forEach((callback) => callback());
    return sdk;
  };
  // analytics.js has loaded but ready never fires (a device-mode destination that never signals).
  const loadSdkWithoutReady = (sdkOptions: { userId?: number | null } = {}) => (
    mockSegment({ ready: false, ...sdkOptions })
  );
  return { queue, loadSdk, loadSdkWithoutReady };
};

// No SEGMENT_KEY, so the constructor doesn't inject analytics.js; mark Segment as loaded instead.
const createService = (ServiceClass: typeof SegmentAnalyticsService) => {
  const service = new ServiceClass({ config: {}, httpClient: {}, loggingService: { logError: jest.fn() } });
  service.segmentInitialized = true;
  return service;
};

const startAnonymousSession = async (service: InstanceType<typeof SegmentAnalyticsService>) => {
  const identified = service.identifyAnonymousUser();
  jest.advanceTimersByTime(2000);
  await identified;
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

  it('sends calls straight to the SDK for a user logged in at page load, without holding them', () => {
    const analytics = mockSegment({ ready: false });
    const service = createService(CheckoutSegmentAnalyticsService);

    // frontend-platform calls identifyAuthenticatedUser, not identifyAnonymousUser, for this user.
    service.identifyAuthenticatedUser(123);
    service.sendTrackEvent('edx.ui.enterprise.checkout.checkout_started', {});

    expect(analytics.sent).toEqual([
      { method: 'identify', userId: 123 },
      { method: 'track', name: 'edx.ui.enterprise.checkout.checkout_started', userId: 123 },
    ]);
    expect(analytics.ready).not.toHaveBeenCalled();
  });

  it("frontend-platform's service drops anonymous events without GA/GTM (remove the override once this fails)", async () => {
    const analytics = mockSegment({ ready: false });
    const service = createService(SegmentAnalyticsService);

    await startAnonymousSession(service);
    service.sendTrackEvent('edx.ui.enterprise.checkout.checkout_started', {});

    expect(analytics.track).not.toHaveBeenCalled();
  });

  it('sends anonymous events after the timeout without GA/GTM', async () => {
    const analytics = mockSegment({ ready: false });
    const service = createService(CheckoutSegmentAnalyticsService);

    await startAnonymousSession(service);
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

    await startAnonymousSession(service);
    service.identifyAuthenticatedUser(123);
    service.sendTrackEvent('edx.ui.enterprise.checkout.signed_in', {});

    expect(analytics.sent).toEqual([
      { method: 'identify', userId: 123 },
      { method: 'track', name: 'edx.ui.enterprise.checkout.signed_in', userId: 123 },
    ]);
  });

  it('resets a leftover user id at the timeout when the SDK has loaded but ready is still pending', async () => {
    const analytics = mockSegment({ ready: false, userId: 42 });
    const service = createService(CheckoutSegmentAnalyticsService);

    await startAnonymousSession(service);
    service.sendTrackEvent('edx.ui.enterprise.checkout.checkout_started', {});

    expect(analytics.sent).toEqual([
      { method: 'reset', userId: null },
      { method: 'track', name: 'edx.ui.enterprise.checkout.checkout_started', userId: null },
    ]);
  });

  describe('while analytics.js is still loading (snippet queue)', () => {
    it('holds anonymous events out of the snippet queue and replays them after the leftover user id is reset', async () => {
      const { queue, loadSdk } = mockSnippetQueue();
      const service = createService(CheckoutSegmentAnalyticsService);

      await startAnonymousSession(service);
      service.sendPageEvent('enterprise_checkout', 'checkout_page_viewed', {});
      service.sendTrackEvent('edx.ui.enterprise.checkout.checkout_started', {});
      const sdk = loadSdk({ userId: 42 });

      expect(queue.track).not.toHaveBeenCalled();
      expect(queue.page).not.toHaveBeenCalled();
      expect(sdk.sent).toEqual([
        { method: 'reset', userId: null },
        { method: 'page', name: 'checkout_page_viewed', userId: null },
        { method: 'track', name: 'edx.ui.enterprise.checkout.checkout_started', userId: null },
      ]);
      expect(service.loggingService.logError).not.toHaveBeenCalled();
    });

    it('replays an in-app login in order, so signed_in carries the new userId, not the leftover one', async () => {
      const { queue, loadSdk } = mockSnippetQueue();
      const service = createService(CheckoutSegmentAnalyticsService);

      await startAnonymousSession(service);
      service.sendTrackEvent('edx.ui.enterprise.checkout.checkout_started', {});
      service.identifyAuthenticatedUser(123);
      service.sendTrackEvent('edx.ui.enterprise.checkout.signed_in', {});
      const sdk = loadSdk({ userId: 42 });

      expect(queue.identify).not.toHaveBeenCalled();
      expect(sdk.sent).toEqual([
        { method: 'reset', userId: null },
        { method: 'track', name: 'edx.ui.enterprise.checkout.checkout_started', userId: null },
        { method: 'identify', userId: 123 },
        { method: 'track', name: 'edx.ui.enterprise.checkout.signed_in', userId: 123 },
      ]);
    });

    it('replays held calls when analytics.js loads after the timeout and ready never fires', async () => {
      const { queue, loadSdkWithoutReady } = mockSnippetQueue();
      const service = createService(CheckoutSegmentAnalyticsService);

      await startAnonymousSession(service);
      service.sendTrackEvent('edx.ui.enterprise.checkout.checkout_started', {});
      jest.advanceTimersByTime(5000);
      expect(queue.track).not.toHaveBeenCalled();

      const sdk = loadSdkWithoutReady({ userId: 42 });
      jest.advanceTimersByTime(500);
      service.sendTrackEvent('edx.ui.enterprise.checkout.step_viewed', {});

      expect(sdk.sent).toEqual([
        { method: 'reset', userId: null },
        { method: 'track', name: 'edx.ui.enterprise.checkout.checkout_started', userId: null },
        { method: 'track', name: 'edx.ui.enterprise.checkout.step_viewed', userId: null },
      ]);
      // Polling stops once the SDK has loaded.
      expect(jest.getTimerCount()).toBe(0);
    });

    it('sends calls straight to the SDK once replayed', async () => {
      const { loadSdk } = mockSnippetQueue();
      const service = createService(CheckoutSegmentAnalyticsService);

      await startAnonymousSession(service);
      const sdk = loadSdk();
      service.sendTrackEvent('edx.ui.enterprise.checkout.checkout_started', {});

      expect(sdk.track).toHaveBeenCalledWith('edx.ui.enterprise.checkout.checkout_started', {});
    });
  });

  it('does not reset a user identified in-app when ready fires after the timeout already replayed', async () => {
    const analytics = mockSegment({ ready: false });
    const service = createService(CheckoutSegmentAnalyticsService);

    await startAnonymousSession(service);
    service.identifyAuthenticatedUser(123);
    const [[lateReadyCallback]] = analytics.ready.mock.calls;
    lateReadyCallback();

    expect(analytics.reset).not.toHaveBeenCalled();
    expect(analytics.user().id()).toBe(123);
  });

  it('clears the timer once ready has run, so the timeout does nothing', async () => {
    const analytics = mockSegment({ userId: 42 });
    const service = createService(CheckoutSegmentAnalyticsService);
    await service.identifyAnonymousUser();
    expect(analytics.reset).toHaveBeenCalledTimes(1);
    expect(jest.getTimerCount()).toBe(0);
    // A user id set on the SDK directly after ready, not through this service.
    analytics.identify(7);

    jest.advanceTimersByTime(2000);
    service.sendTrackEvent('edx.ui.enterprise.checkout.checkout_started', {});

    expect(analytics.reset).toHaveBeenCalledTimes(1);
    expect(analytics.user().id()).toBe(7);
    expect(analytics.track).toHaveBeenCalledWith('edx.ui.enterprise.checkout.checkout_started', {});
  });

  describe('when analytics.js fails to load (e.g. ad blocker)', () => {
    // Uses frontend-platform's real snippet and its real script.onerror, not a hand-built queue.
    const createServiceWithRealSnippet = () => {
      document.head.appendChild(document.createElement('script'));
      // Typed as the base class, as in createService: its untyped constructor takes the config.
      const ServiceClass: typeof SegmentAnalyticsService = CheckoutSegmentAnalyticsService;
      const service = new ServiceClass({
        config: { SEGMENT_KEY: 'test-key' }, httpClient: {}, loggingService: { logError: jest.fn() },
      });
      const segmentScript = document.querySelector<HTMLScriptElement>('script[src*="cdn.segment.com"]');
      const snippetQueue = (window as any).analytics as unknown[];
      const queuedMethods = () => snippetQueue.filter(Array.isArray).map(([method]) => method);
      return { service, failScript: () => segmentScript!.onerror!(new Event('error')), queuedMethods };
    };

    afterEach(() => { document.head.innerHTML = ''; });

    it('resolves, turns Segment off and drops held and later calls', async () => {
      const { service, failScript, queuedMethods } = createServiceWithRealSnippet();
      expect(service.segmentInitialized).toBe(true);

      const identified = service.identifyAnonymousUser();
      service.sendTrackEvent('edx.ui.enterprise.checkout.checkout_started', {});
      failScript();
      service.sendTrackEvent('edx.ui.enterprise.checkout.step_viewed', {});
      service.sendPageEvent('enterprise_checkout', 'checkout_page_viewed', {});
      service.identifyAuthenticatedUser(123);
      jest.advanceTimersByTime(2000);

      await expect(identified).resolves.toBeUndefined();
      expect(service.segmentInitialized).toBe(false);
      expect(queuedMethods()).toEqual(['ready']);
    });

    it('drops held and later calls when the script fails after the timeout', async () => {
      const { service, failScript, queuedMethods } = createServiceWithRealSnippet();

      const identified = service.identifyAnonymousUser();
      service.sendTrackEvent('edx.ui.enterprise.checkout.checkout_started', {});
      jest.advanceTimersByTime(2000);
      await expect(identified).resolves.toBeUndefined();
      expect(service.segmentInitialized).toBe(true);

      failScript();
      service.sendTrackEvent('edx.ui.enterprise.checkout.step_viewed', {});
      service.identifyAuthenticatedUser(123);
      jest.advanceTimersByTime(5000);

      expect(service.segmentInitialized).toBe(false);
      expect(queuedMethods()).toEqual(['ready']);
      // Polling for the SDK stops once the script has failed.
      expect(jest.getTimerCount()).toBe(0);
    });
  });

  it('resolves immediately when Segment is not initialized', async () => {
    const analytics = mockSegment();
    const service = createService(CheckoutSegmentAnalyticsService);
    service.segmentInitialized = false;

    await service.identifyAnonymousUser();

    expect(analytics.ready).not.toHaveBeenCalled();
  });
});
