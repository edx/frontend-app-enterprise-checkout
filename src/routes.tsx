import { QueryClient } from '@tanstack/react-query';
import { RouteObject } from 'react-router';
import { AuthenticatedPageRoute, PageWrap } from '@edx/frontend-platform/react';
import { Suspense } from 'react';
import Root from '@/components/app/Root';
import RouterFallback from '@/components/app/routes/RouterFallback';
import { Navigate } from 'react-router-dom';
import CheckoutPage from '@/components/CheckoutPage';
import ConfirmationPage from '@/components/ConfirmationPage';
import Layout from '@/components/app/Layout';

function getCheckoutRoutes(queryClient: QueryClient) {
  const checkoutChildRoutes: RouteObject[] = [
    {
      index: true,
      element: <Navigate to="checkout" replace />,
    },
    {
      path: 'checkout/:step?',
      element: (
        <PageWrap>
          <CheckoutPage />
        </PageWrap>
      ),
    },
    {
      path: 'checkout/confirmation',
      element: (
        <AuthenticatedPageRoute>
          <ConfirmationPage />
        </AuthenticatedPageRoute>
      ),
    },
  ];
  const checkoutRoutes: RouteObject[] = [
    {
      path: '/',
      element: <Layout />,
      children: checkoutChildRoutes,
      shouldRevalidate: ({ currentUrl, nextUrl, defaultShouldRevalidate }) => {
        // If the pathname changed, we should revalidate
        if (currentUrl.pathname !== nextUrl.pathname) {
          return true;
        }

        // If the pathname didn't change, fallback to the default behavior
        return defaultShouldRevalidate;
      },
    },
  ];
  return checkoutRoutes;
}

/**
 * Returns the routes for the application.
 */
export function getRoutes(queryClient: QueryClient) {
  const checkoutRoutes = getCheckoutRoutes(queryClient);
  const rootChildRoutes: RouteObject[] = [
    ...checkoutRoutes,
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
  };
}
