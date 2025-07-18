import { AuthenticatedPageRoute, PageWrap } from '@edx/frontend-platform/react';
import { QueryClient } from '@tanstack/react-query';
import { Suspense } from 'react';
import { RouteObject, useParams } from 'react-router';
import { Navigate } from 'react-router-dom';

import Layout from '@/components/app/Layout';
import Root from '@/components/app/Root';
import RouterFallback from '@/components/app/routes/RouterFallback';
import CheckoutPage from '@/components/checkout-page/CheckoutPage';
import { authenticatedSteps, CheckoutStep } from '@/components/Stepper/constants';

const StepWrapper = () => {
  const { step } = useParams<{ step: AuthStep }>();

  return authenticatedSteps.includes(step as AuthStep)
    ? (
      <AuthenticatedPageRoute>
        <CheckoutPage />
      </AuthenticatedPageRoute>
    )
    : <CheckoutPage />;
};

// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getCheckoutRoutes(queryClient: QueryClient) {
  const checkoutChildRoutes: RouteObject[] = [
    {
      path: '/:step?',
      element: (
        <PageWrap>
          <StepWrapper />
        </PageWrap>
      ),
    },
    {
      index: true,
      element: <Navigate to={CheckoutStep.BuildTrial} replace />,
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
