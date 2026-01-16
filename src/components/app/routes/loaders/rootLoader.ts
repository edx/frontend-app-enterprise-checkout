import {
  fetchAuthenticatedUser,
  getAuthenticatedUser,
  hydrateAuthenticatedUser,
} from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform/config';
import { logError, logInfo } from '@edx/frontend-platform/logging';
import { QueryClient } from '@tanstack/react-query';
import { LoaderFunction, redirect } from 'react-router-dom';

import { queryBffContext } from '@/components/app/data/queries/queries';
import {
  determineExistingCheckoutIntentState,
  populateInitialApplicationState,
} from '@/components/app/routes/loaders/utils';
import { CheckoutPageRoute, EssentialsPageRoute } from '@/constants/checkout';
import { extractPriceId } from '@/utils/checkout';
import { isFeatureEnabled } from '@/utils/common';

/**
 * Factory that creates the root route loader for the Enterprise Checkout MFE.
 *
 * Behavior overview:
 * - Hydrates the authenticated user (JWT + LMS profile) to get user details.
 * - Fetches the BFF checkout context and inspects checkoutIntent.
 * - Updates local form store with values inferred from the authenticated user and checkout intent.
 * - Redirects based on user/auth state and checkout intent:
 *   - Unauthenticated:
 *     - If on a protected path (Account Details, Billing Details, Billing Details Success) → redirect to Plan Details
 *     - Otherwise (e.g., already on Plan Details or its subroutes) → no redirect (stay on current route)
 *   - Successful intent (paid/fulfilled) → Billing Details Success
 *   - Expired intent → Plan Details
 *   - Otherwise (active/in-progress) → No redirect (stay on current route)
 *
 * @param {QueryClient} queryClient - TanStack Query client used to prefetch/ensure the BFF context.
 * @returns {LoaderFunction} A React Router loader that performs the redirect logic described above.
 */

type FeatureRoute = {
  routes: readonly string[];
  enabled: boolean;
  featureKey: string | null;
};

const isPathMatch = (pathname: string, route: string) => pathname === route || pathname.startsWith(`${route}/`);

export function getFeatureForPath(pathname: string) {
  const {
    FEATURE_SELF_SERVICE_PURCHASING,
    FEATURE_SELF_SERVICE_PURCHASING_KEY,
    FEATURE_SELF_SERVICE_ESSENTIALS,
    FEATURE_SELF_SERVICE_ESSENTIALS_KEY,
  } = getConfig();

  const featureRoutes: FeatureRoute[] = [
    {
      routes: Object.values(CheckoutPageRoute),
      enabled: FEATURE_SELF_SERVICE_PURCHASING,
      featureKey: FEATURE_SELF_SERVICE_PURCHASING_KEY,
    },
    {
      routes: Object.values(EssentialsPageRoute),
      enabled: FEATURE_SELF_SERVICE_ESSENTIALS,
      featureKey: FEATURE_SELF_SERVICE_ESSENTIALS_KEY,
    },
  ];

  const match = featureRoutes.find(
    ({ routes, enabled }) => !enabled && routes.some(route => isPathMatch(pathname, route)),
  );

  return match?.featureKey ?? null;
}

const makeRootLoader = (
  queryClient: QueryClient,
): LoaderFunction => async function rootLoader({ request }) {
  const SSP_SESSION_KEY = 'edx.checkout.self-service-purchasing';

  const {
    FEATURE_SELF_SERVICE_SITE_KEY,
  } = getConfig();

  const currentPath = new URL(request.url).pathname;

  // Route-aware feature key
  const routeFeatureKey = getFeatureForPath(currentPath);

  // Feature flag check
  if (routeFeatureKey) {
    const isUnlocked = isFeatureEnabled(false, routeFeatureKey);

    if (!isUnlocked) {
      const featureParam = new URL(request.url).searchParams.get('feature');

      const paramIsSiteKey = !!FEATURE_SELF_SERVICE_SITE_KEY
          && featureParam === FEATURE_SELF_SERVICE_SITE_KEY;

      const paramIsRouteKey = featureParam === routeFeatureKey;

      if (!paramIsSiteKey && !paramIsRouteKey) {
        logError('Self-service purchasing is not enabled');
        throw new Error('Self-service purchasing is not enabled');
      }
      const keyToStore = paramIsRouteKey
        ? routeFeatureKey
        : FEATURE_SELF_SERVICE_SITE_KEY;

      logInfo(`Self-service purchasing is enabled. Setting feature flag in session storage. Key: ${keyToStore}`);

      sessionStorage.setItem(SSP_SESSION_KEY, keyToStore);
    }
  }

  /**
   * IMPORTANT:
   * Essentials routes do not participate in checkout intent logic.
   * This check happens AFTER feature flag validation.
   */
  // const isCheckoutRoute = !Object.values(EssentialsPageRoute).some(route => isPathMatch(currentPath, route));
  //
  // if (!isCheckoutRoute) {
  //   return null;
  // }

  // Fetch basic info about authenticated user from JWT token, and also hydrate it with additional
  // information from the `<LMS>/api/user/v1/accounts/<username>` endpoint. We need access to the
  // logged-in user's country if they are pre-registered.
  await fetchAuthenticatedUser();
  await hydrateAuthenticatedUser();
  const authenticatedUser: AuthenticatedUser = getAuthenticatedUser();

  const contextMetadata: CheckoutContextResponse = await queryClient.ensureQueryData(
    queryBffContext(authenticatedUser?.userId || null),
  );

  // Helper to avoid self-redirect loops
  /**
     * Return a redirect Response to `to` unless it matches currentPath, in which case return null.
     *
     * @param {string} to - Target path to potentially redirect to.
     * @returns {Response | null} A redirect response if different from current path; otherwise null.
     */
  const redirectOrNull = (to: string) => (to !== currentPath ? redirect(to) : null);

  const protectedPaths = new Set<string>([
    CheckoutPageRoute.BillingDetails,
    CheckoutPageRoute.AccountDetails,
    CheckoutPageRoute.BillingDetailsSuccess,
  ]);

  // Unauthenticated user on protected paths → redirect to Plan Details
  if (!authenticatedUser && protectedPaths.has(currentPath)) {
    return redirectOrNull(CheckoutPageRoute.PlanDetails);
  }

  const { checkoutIntent, pricing } = contextMetadata;

  const {
    existingSuccessfulCheckoutIntent,
    expiredCheckoutIntent,
  } = determineExistingCheckoutIntentState(checkoutIntent);

  const stripePriceId = extractPriceId(pricing);

  populateInitialApplicationState({
    checkoutIntent,
    stripePriceId,
    authenticatedUser,
  });

  if (!authenticatedUser) {
    return null;
  }

  // Successful intent → Success page
  if (existingSuccessfulCheckoutIntent) {
    return redirectOrNull(CheckoutPageRoute.BillingDetailsSuccess);
  }

  // Expired intent → Plan Details
  if (expiredCheckoutIntent) {
    return redirectOrNull(CheckoutPageRoute.PlanDetails);
  }
  return null;
};

export default makeRootLoader;
