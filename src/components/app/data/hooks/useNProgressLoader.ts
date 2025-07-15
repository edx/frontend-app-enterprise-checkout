import { useEffect, useState } from 'react';
import { useFetchers, useNavigation } from 'react-router-dom';
import nprogress from 'accessible-nprogress';
import { useIsFetching } from '@tanstack/react-query';

// Determines amount of time that must elapse before the
// NProgress loader is shown in the UI. No need to show it
// for quick route transitions.
export const NPROGRESS_DELAY_MS = 300;

export interface UseNProgressLoaderOptions {
  // Whether to wait for the navigation to complete before completing the loader.
  shouldCompleteBeforeUnmount?: boolean;
  // Whether to wait for the query fetching to complete before completing the loader.
  handleQueryFetching?: boolean;
}

function useNProgressLoader({
  shouldCompleteBeforeUnmount = true,
  handleQueryFetching = false,
}: UseNProgressLoaderOptions = {}) {
  const navigation = useNavigation();
  const fetchers = useFetchers();
  const isFetching = useIsFetching() > 0 && handleQueryFetching;
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const fetchersIdle = fetchers.every((f) => f.state === 'idle');
      if (shouldCompleteBeforeUnmount && navigation.state === 'idle' && fetchersIdle && !isFetching) {
        nprogress.done();
        setIsLoaded(true);
      } else {
        nprogress.start();
      }
    }, NPROGRESS_DELAY_MS);
    return () => {
      nprogress.done();
      clearTimeout(timeoutId);
    };
  }, [navigation, fetchers, isFetching, shouldCompleteBeforeUnmount]);

  return isLoaded;
}

export default useNProgressLoader;
