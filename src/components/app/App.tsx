import { AppProvider } from '@edx/frontend-platform/react';
import {
  keepPreviousData,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import {
  lazy, Suspense, useEffect, useMemo, useState,
} from 'react';
import { RouterProvider } from 'react-router-dom';

import {
  defaultQueryClientRetryHandler,
  queryCacheOnErrorHandler,
} from '@/utils/common';

import { createAppRouter, RouterFallback } from './routes';

// @ts-ignore
const ReactQueryDevtoolsProduction = lazy(() => import('@tanstack/react-query-devtools/production').then((d) => ({
  testId: 'react-query-devtools-production',
  default: d.ReactQueryDevtools,
})));

function useAppQueryClient() {
  const [queryClient] = useState(() => new QueryClient({
    queryCache: new QueryCache({
      onError: queryCacheOnErrorHandler,
    }),
    defaultOptions: {
      queries: {
        // Specifying a longer `staleTime` of 20 seconds means queries will not refetch their data
        // as often; mitigates making duplicate queries when within the `staleTime` window, instead
        // relying on the cached data until the `staleTime` window has exceeded. This may be modified
        // per-query, as needed, if certain queries expect to be more up-to-date than others. Allows
        // `useQuery` to be used as a state manager.
        staleTime: 1000 * 20, // 20 seconds
        // To prevent hard loading states if/when query keys change during automatic query background
        // re-fetches, we can utilize `keepPreviousData` to keep the previous data until the new
        // data is fetched. By enabling this option, UI components generally will not need to consider
        // hard loading states when query keys change.
        placeholderData: keepPreviousData,
        // If a query fails, it will retry up to 3 times for queries with non-404 errors.
        retry: defaultQueryClientRetryHandler,
      },
    },
  }));
  return queryClient;
}

function useReactQueryDevTools() {
  const [showReactQueryDevtools, setShowReactQueryDevtools] = useState(false);
  useEffect(() => {
    // @ts-ignore
    window.toggleReactQueryDevtools = () => setShowReactQueryDevtools((prevState) => !prevState);
  });
  return showReactQueryDevtools;
}

const App = () => {
  const queryClient = useAppQueryClient();
  // Create the app router during render vs. at the top-level of the module to ensure
  // the logging and auth modules are initialized before the router is created.
  const router = useMemo(() => createAppRouter(queryClient), [queryClient]);

  const showReactQueryDevtools = useReactQueryDevTools();

  return (
    <QueryClientProvider
      client={queryClient}
      data-testid="query-client-provider"
    >
      <ReactQueryDevtools
        initialIsOpen={false}
        data-testid="react-query-devtools"
      />

      {showReactQueryDevtools && (
        <Suspense fallback={null}>
          <ReactQueryDevtoolsProduction
            data-testid="react-query-devtools-production"
          />
        </Suspense>
      )}
      <AppProvider
        wrapWithRouter={false}
        data-testid="app-provider"
      >
        <RouterProvider
          router={router}
          data-testid="router-provider"
          fallbackElement={
            <RouterFallback data-testid="router-fallback" />
          }
        />
      </AppProvider>
    </QueryClientProvider>
  );
};

export default App;
