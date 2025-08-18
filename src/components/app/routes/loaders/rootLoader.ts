import {
  fetchAuthenticatedUser,
  getAuthenticatedUser,
  hydrateAuthenticatedUser,
} from '@edx/frontend-platform/auth';
import { redirect } from 'react-router-dom';

import { queryBffContext } from '@/components/app/data/queries/queries';
import { determineExistingPaidCheckoutIntent } from '@/components/app/routes/loaders/utils';
import { CheckoutPageRoute } from '@/constants/checkout';

/**
 * Root loader for the Enterprise Checkout MFE.
 */
const makeRootLoader: MakeRouteLoaderFunctionWithQueryClient = function makeRootLoader(queryClient) {
  return async function rootLoader() {
    // Fetch basic info about authenticated user from JWT token, and also hydrate it with additional
    // information from the `<LMS>/api/user/v1/accounts/<username>` endpoint. We need access to the
    // logged-in user's country if they are pre-registered.
    await fetchAuthenticatedUser();
    await hydrateAuthenticatedUser();
    const authenticatedUser: AuthenticatedUser = getAuthenticatedUser();

    const contextMetadata: CheckoutContextResponse = await queryClient.ensureQueryData(queryBffContext());

    // TODO: do the right stuff depending on whether the user is logged in.
    if (!authenticatedUser) {
      redirect(CheckoutPageRoute.PlanDetails);
      return null;
    }

    const { checkoutIntent } = contextMetadata;
    const { existingPaidCheckoutIntent } = determineExistingPaidCheckoutIntent(checkoutIntent);

    if (!existingPaidCheckoutIntent) {
      redirect(CheckoutPageRoute.PlanDetails);
    } else {
      redirect(CheckoutPageRoute.BillingDetailsSuccess);
    }

    return null;
  };
};

export default makeRootLoader;
