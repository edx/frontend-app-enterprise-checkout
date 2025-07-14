import {QueryClient} from "@tanstack/react-query";
import {RouteObject} from "react-router";
import {PageWrap} from "@edx/frontend-platform/react";
import {Suspense} from "react";

/**
 * Returns the routes for the application.
 */
export function getRoutes(queryClient?: QueryClient) {
  const otherRoutes = getOtherRoutes();
  const rootChildRoutes: RouteObject[] = [
    ...otherRoutes,
    {
      path: '*',
      element: (<div>Not Found</div>),
    },
  ];

  const routes: RouteObject[] = [
    {
      path: '/',
      element: (
        <PageWrap>
          <Suspense fallback={<RouterFallback loaderOptions={{ handleQueryFetching: true }} />}>
            <Root />
          </Suspense>
        </PageWrap>
      ),
      children: rootChildRoutes,
      errorElement: (<div>Error Boundary</div>),
    },
  ];

  return {
    routes,
    rootChildRoutes,
    otherRoutes,
  };
}
