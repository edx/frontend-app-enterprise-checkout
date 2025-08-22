import { useEffect } from 'react';

import { progressBegin, progressEnd } from './progress';

/**
 * Suspense fallback for router-level lazy routes.
 * Starts the progress indicator on mount and ends it on unmount.
 *
 * @returns {null} Currently renders nothing; may be replaced with a visual loader.
 */
const RouterFallback = (): null => {
  useEffect(() => {
    progressBegin();
    return () => progressEnd();
  }, []);

  // TODO: Replace with reasonable fallback
  return null;
};

export default RouterFallback;
