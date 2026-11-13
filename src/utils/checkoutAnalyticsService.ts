import { SegmentAnalyticsService } from '@edx/frontend-platform/analytics';

// frontend-platform resolves this so the app never waits on a blocked analytics.js. Kept the same.
const IDENTIFY_ANONYMOUS_USER_TIMEOUT_MS = 2000;

// Fields set by the untyped base class's constructor. Merged as an interface so nothing is emitted.
export interface CheckoutSegmentAnalyticsService {
  segmentInitialized: boolean;
  hasIdentifyBeenCalled: boolean;
}

/**
 * Segment analytics service for checkout, passed to frontend-platform's `initialize()`.
 *
 * frontend-platform's `identifyAnonymousUser` turns Segment off (`segmentInitialized = false`) when
 * `window.ga.create` or `window.google_tag_manager` is missing 2s after start-up. Checkout loads
 * neither, so every event from an anonymous user was silently dropped, and stayed dropped after
 * in-app login or registration until a full page reload. This override keeps the same identify
 * flow and timeout but leaves Segment on. If analytics.js itself fails to load, the base class
 * still turns Segment off.
 *
 * While analytics.js loads for an anonymous user, track, page and identify calls are held here
 * instead of in the snippet's queue. Analytics Next replays that queue grouped by method (every
 * track before any identify), and before `ready` could clear a user id left over from a previous
 * session. Once the SDK has loaded, the leftover id is cleared and the held calls are replayed
 * in order. Checkout never waits on this: the calls are fire-and-forget.
 *
 * Remove once frontend-platform stops gating Segment on GA/GTM.
 */
export class CheckoutSegmentAnalyticsService extends SegmentAnalyticsService {
  // Calls held until the SDK has loaded; null when calls go straight through.
  private pendingCalls: Array<() => void> | null = null;

  identifyAuthenticatedUser(userId: number | string, traits?: Record<string, unknown>): void {
    // Without a userId the base class throws; let it, synchronously, rather than at replay.
    if (this.pendingCalls && userId) {
      this.pendingCalls.push(() => super.identifyAuthenticatedUser(userId, traits));
      return;
    }
    super.identifyAuthenticatedUser(userId, traits);
  }

  sendTrackEvent(eventName: string, properties?: Record<string, unknown>): void {
    if (this.pendingCalls) {
      this.pendingCalls.push(() => super.sendTrackEvent(eventName, properties));
      return;
    }
    super.sendTrackEvent(eventName, properties);
  }

  sendPageEvent(category?: string, name?: string, properties?: Record<string, unknown>): void {
    if (this.pendingCalls) {
      this.pendingCalls.push(() => super.sendPageEvent(category, name, properties));
      return;
    }
    super.sendPageEvent(category, name, properties);
  }

  // Runs once, on the loaded SDK. None of checkout's calls have reached it yet, so any user id it
  // holds is left over from a previous session and belongs to someone else.
  private flushPendingCalls(): void {
    const calls = this.pendingCalls;
    if (!calls) {
      return;
    }
    this.pendingCalls = null;
    const { analytics } = window as any;
    if (analytics.user().id()) {
      analytics.reset();
    }
    // Segment assigns anonymous users an anonymousId, so no identify call is needed.
    this.hasIdentifyBeenCalled = true;
    calls.forEach((call) => call());
  }

  identifyAnonymousUser(): Promise<void> {
    if (!this.segmentInitialized) {
      return Promise.resolve();
    }
    this.pendingCalls = [];
    return new Promise((resolve) => {
      let timeoutId: ReturnType<typeof setTimeout> | undefined;
      const segmentFailedListener = new AbortController();
      // Once the SDK has loaded or failed, nothing else needs the timer or the listener. The timer and
      // listener are set up before ready is registered, so a ready that runs synchronously clears both.
      const stopWaiting = () => {
        clearTimeout(timeoutId);
        segmentFailedListener.abort();
        resolve();
      };

      timeoutId = setTimeout(() => {
        // If analytics.js has loaded but ready is still pending, settle now so events aren't held.
        if (typeof (window as any).analytics.user === 'function') {
          this.flushPendingCalls();
          stopWaiting();
          return;
        }
        // Still loading (snippet queue, no user()): let checkout continue, but keep holding calls
        // until ready, and keep listening for segmentFailed so they're dropped if it never loads.
        resolve();
      }, IDENTIFY_ANONYMOUS_USER_TIMEOUT_MS);
      document.addEventListener('segmentFailed', () => {
        // Segment is off (the base class set segmentInitialized = false), so held calls are dropped.
        this.pendingCalls = null;
        stopWaiting();
      }, { signal: segmentFailedListener.signal });
      // On a cold start window.analytics is the snippet's queue here; analytics.js replaces it with
      // the loaded SDK before this callback runs, and flushPendingCalls reads it then.
      (window as any).analytics.ready(() => {
        this.flushPendingCalls();
        stopWaiting();
      });
    });
  }
}
