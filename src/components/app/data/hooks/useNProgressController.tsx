import { useIsFetching } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import { useFetchers, useNavigation } from 'react-router-dom';

import { progressBegin, progressEnd } from '@/components/app/routes/progress';

const NPROGRESS_DELAY_MS = 300;

/**
 * Derives whether the application is currently routing or fetching.
 * Combines react-router navigation state, active fetchers, and React Query fetching state.
 *
 * @returns {boolean} True if a navigation or fetch is in-flight; otherwise false.
 */
function useNProgressSignals() {
  const navigation = useNavigation();
  const fetchers = useFetchers();
  const rqFetchCount = useIsFetching();
  const rqLoading = rqFetchCount > 0;

  const anyFetcherLoading = useMemo(
    () => fetchers.some(f => f.state === 'loading'),
    [fetchers],
  );

  return navigation.state === 'loading' || anyFetcherLoading || rqLoading;
}

/**
 * Controls the top-of-page progress bar (accessible-nprogress) based on routing signals.
 * Adds a small delay to avoid flashing for very fast transitions.
 *
 * @returns {void}
 */
function useNProgressController() {
  const isRouting = useNProgressSignals();

  useEffect(() => {
    let started = false;
    const id = setTimeout(() => {
      if (isRouting) {
        progressBegin();
        started = true;
      }
    }, NPROGRESS_DELAY_MS);

    return () => {
      clearTimeout(id);
      if (started) { progressEnd(); }
    };
  }, [isRouting]);
}

export default useNProgressController;
