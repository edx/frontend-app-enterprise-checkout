import {
  fetchAuthenticatedUser,
  getAuthenticatedUser,
  hydrateAuthenticatedUser,
} from '@edx/frontend-platform/auth';
import { QueryClient } from '@tanstack/react-query';
import { LoaderFunction, redirect } from 'react-router-dom';

import { queryBffContext } from '@/components/app/data/queries/queries';
import { determineExistingCheckoutIntentState, populateCompletedFormFields } from '@/components/app/routes/loaders/utils';
import { CheckoutPageRoute } from '@/constants/checkout';

/**
 * Factory that creates the root route loader for the Enterprise Checkout MFE.
 *
 * Behavior overview:
 * - Hydrates the authenticated user (JWT + LMS profile) to get user details.
 * - Fetches the BFF checkout context and inspects checkoutIntent.
 * - Updates local form store with values inferred from the authenticated user and checkout intent.
 * - Redirects based on user/auth state and checkout intent:
 *   - Unauthenticated → Plan Details
 *   - Successful intent (paid/fulfilled) → Billing Details Success
 *   - Expired intent → Plan Details
 *   - Otherwise (active/in-progress) → No redirect (stay on current route)
 *
 * @param {QueryClient} queryClient - TanStack Query client used to prefetch/ensure the BFF context.
 * @returns {LoaderFunction} A React Router loader that performs the redirect logic described above.
 */
const makeRootLoader: MakeRouteLoaderFunctionWithQueryClient = function makeRootLoader(
  queryClient: QueryClient,
): LoaderFunction {
  return async function rootLoader({ request }) {
    // Fetch basic info about authenticated user from JWT token, and also hydrate it with additional
    // information from the `<LMS>/api/user/v1/accounts/<username>` endpoint. We need access to the
    // logged-in user's country if they are pre-registered.
    await fetchAuthenticatedUser();
    await hydrateAuthenticatedUser();
    const authenticatedUser: AuthenticatedUser = getAuthenticatedUser();

    const contextMetadata: CheckoutContextResponse = await queryClient.ensureQueryData(queryBffContext());
    const currentPath = new URL(request.url).pathname;

    // Helper to avoid self-redirect loops
    const redirectOrNull = (to: string) => (to !== currentPath ? redirect(to) : null);

    // Unauthenticated user → Plan Details
    if (!authenticatedUser) {
      return redirectOrNull(CheckoutPageRoute.PlanDetails);
    }

    const { checkoutIntent } = contextMetadata;
    const {
      existingSuccessfulCheckoutIntent, expiredCheckoutIntent,
    } = determineExistingCheckoutIntentState(checkoutIntent);

    populateCompletedFormFields({
      checkoutIntent,
      authenticatedUser,
    });

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
};

export default makeRootLoader;
