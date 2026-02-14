import { AuthenticatedPageRoute, PageWrap } from '@edx/frontend-platform/react';
import { QueryClient } from '@tanstack/react-query';
import { Suspense } from 'react';
import { RouteObject, useParams } from 'react-router';
import { Navigate } from 'react-router-dom';

import Layout from '@/components/app/Layout';
import Root from '@/components/app/Root';
import AppShell from '@/components/app/routes/AppShell';
import { makeCheckoutStepperLoader, makeRootLoader } from '@/components/app/routes/loaders';
import RouterFallback from '@/components/app/routes/RouterFallback';
import CheckoutPage from '@/components/checkout-page/CheckoutPage';
import { authenticatedSteps, CheckoutStepKey } from '@/constants/checkout';

import { ErrorPage } from './components/ErrorPage';

/**
 * Returns the route loader function if a queryClient is available; otherwise, returns null.
 */
export function getRouteLoader(makeRouteLoaderFn: MakeRouteLoaderFunction, queryClient?: QueryClient) {
  if (!queryClient) {
    return undefined;
  }
  return makeRouteLoaderFn(queryClient);
}

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
      loader: getRouteLoader(makeCheckoutStepperLoader, queryClient),
      element: (
        <PageWrap>
          <StepWrapper />
        </PageWrap>
      ),
    },
    {
      path: '/:step/:substep',
      loader: getRouteLoader(makeCheckoutStepperLoader, queryClient),
      element: (
        <PageWrap>
          <StepWrapper />
        </PageWrap>
      ),
    },
    {
      index: true,
      element: <Navigate to={CheckoutStepKey.PlanDetails} replace />,
    },
  ];
  const checkoutRoutes: RouteObject[] = [
    {
      path: '/',
      loader: getRouteLoader(makeRootLoader, queryClient),
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
  const routes: RouteObject[] = [
    {
      element: (
        <PageWrap>
          <AppShell />
        </PageWrap>
      ),
      loader: getRouteLoader(makeRootLoader, queryClient),
      errorElement: <ErrorPage message="Error Boundary" />,
      children: [
        // {
        //   path: 'essentials',
        //   element: (
        //     <PageWrap>
        //       <Suspense fallback={<RouterFallback />}>
        //         <Layout />
        //       </Suspense>
        //     </PageWrap>
        //   ),
        //   children: [
        //     {
        //       index: true,
        //       element: <Navigate to={EssentialsStepKey.AcademicSelection} replace />,
        //     },
        //     {
        //       path: EssentialsStepKey.AcademicSelection,
        //       element: (
        //         <PageWrap>
        //           <AcademicSelection />
        //         </PageWrap>
        //       ),
        //     },
        //   ],
        // },
        // {
        //   path: 'essentials/*',
        //   element: <ErrorPage message="Page Not Found" />,
        // },
        {
          path: '/',
          loader: getRouteLoader(makeRootLoader, queryClient),
          element: (
            <PageWrap>
              <Suspense fallback={<RouterFallback />}>
                <Root />
              </Suspense>
            </PageWrap>
          ),
          children: checkoutRoutes,
          errorElement: (<ErrorPage message="Error Boundary" />),
        },
        {
          path: '*',
          element: (<ErrorPage message="Not Found" />),
        }],
    },
  ];

  return { routes };
}
