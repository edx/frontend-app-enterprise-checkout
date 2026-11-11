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
 * Remove once frontend-platform stops gating Segment on GA/GTM.
 */
export class CheckoutSegmentAnalyticsService extends SegmentAnalyticsService {
  // Set when a user is identified in-app (login/register) after start-up.
  private hasIdentifiedAuthenticatedUser = false;

  identifyAuthenticatedUser(userId: number | string, traits?: Record<string, unknown>): void {
    super.identifyAuthenticatedUser(userId, traits);
    this.hasIdentifiedAuthenticatedUser = true;
  }

  // A user id left over from a previous session belongs to someone else. Upstream turns Segment off
  // at the 2s timeout, so it never checks late; here a late check can run after an in-app login, and
  // the id is then the user who just signed in, so keep it.
  private resetStaleUser(analytics: any): void {
    if (analytics.user().id() && !this.hasIdentifiedAuthenticatedUser) {
      analytics.reset();
    }
  }

  identifyAnonymousUser(): Promise<void> {
    if (!this.segmentInitialized) {
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      (window as any).analytics.ready(() => {
        // Read window.analytics here, not before: on a cold start the object above is the snippet's
        // queue (no user()), and analytics.js replaces it with the loaded SDK before this runs.
        this.resetStaleUser((window as any).analytics);
        // Segment assigns anonymous users an anonymousId, so no identify call is needed.
        this.hasIdentifyBeenCalled = true;
        resolve();
      });
      document.addEventListener('segmentFailed', () => resolve());
      setTimeout(() => {
        // If analytics.js has loaded but ready is still pending, events are sent right away, so clear
        // a stale user id now rather than at ready. Before it loads, window.analytics is the snippet's
        // queue (no user()); events wait in it and ready clears the id.
        const { analytics } = window as any;
        if (typeof analytics.user === 'function') {
          this.resetStaleUser(analytics);
        }
        // Without this, every event sent before ready logs
        // "Identify must be called before other tracking events."
        this.hasIdentifyBeenCalled = true;
        resolve();
      }, IDENTIFY_ANONYMOUS_USER_TIMEOUT_MS);
    });
  }
}
