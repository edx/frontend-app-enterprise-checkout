import {
  fetchAuthenticatedUser,
  getAuthenticatedUser,
  hydrateAuthenticatedUser,
} from '@edx/frontend-platform/auth';

/**
 * Root loader for the Enterprise Checkout MFE.
 */
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const makeRootLoader: MakeRouteLoaderFunctionWithQueryClient = function makeRootLoader(queryClient) {
  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return async function rootLoader({ params = {}, request }) {
    // Fetch basic info about authenticated user from JWT token, and also hydrate it with additional
    // information from the `<LMS>/api/user/v1/accounts/<username>` endpoint. We need access the the
    // logged-in user's country if they are pre-registered.
    await fetchAuthenticatedUser();
    await hydrateAuthenticatedUser();
    const authenticatedUser = getAuthenticatedUser();

    // TODO: do the right stuff depending on whether the user is logged in.
    if (!authenticatedUser) {
      return null;
    }
    return null;
  };
};

export default makeRootLoader;
