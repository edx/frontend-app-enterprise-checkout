import {
  getAuthenticatedUser,
  hydrateAuthenticatedUser,
} from '@edx/frontend-platform/auth';
import { useCallback, useEffect, useRef, useState } from 'react';

// Repeatedly call the callback function starting when enable turns true.
//
// Notes:
// - The callback function is protected from running in parallel with itself.
function useInterval(
  { callback, enable, delay }: { callback: () => void | Promise<void>, enable: boolean, delay: number },
) {
  const savedCallback = useRef<() => void | Promise<void>>();
  const isExecuting = useRef<boolean>(false);

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    async function tick() {
      // Skip if previous execution is still running
      if (isExecuting.current) {
        return;
      }

      isExecuting.current = true;
      try {
        if (savedCallback.current) {
          await savedCallback.current();
        }
      } finally {
        isExecuting.current = false;
      }
    }

    if (enable) {
      // Call immediately when enabled, since setInterval's first invocation
      // happens after the first delay.
      tick().catch(() => {});
      const id = setInterval(tick, delay);
      return () => {
        clearInterval(id);
        // Reset the flag on cleanup
        isExecuting.current = false;
      };
    }
    return () => {
      isExecuting.current = false;
    };
  }, [enable, delay]);
}

// Poll for authenticated user data.
//
// Only starts polling once isFulfillmentComplete flips to true, avoiding
// needless polling during a period of time when we don't care about the user
// account attributes.
//
// Most importantly, useful for checking when the user eventually activates
// their account via email validation.
const usePolledAuthenticatedUser = () => {
  const [polledAuthenticatedUser, setPolledAuthenticatedUser] = useState<AuthenticatedUser>(
    getAuthenticatedUser(),
  );

  const rehydrateAuthenticatedUser = useCallback(async () => {
    // getAuthenticatedUser() on its own won't actually make any API calls
    // after the value is already cached, which is problematic because
    // fulfillment will change the value AFTER caching, rendering
    // getAuthenticatedUser() useless on its own.
    //
    // Alas, there's a solution: calling hydrateAuthenticatedUser() first will
    // force the user to be re-fetched.
    await hydrateAuthenticatedUser();
    setPolledAuthenticatedUser(getAuthenticatedUser());
  }, []);

  useInterval({
    callback: rehydrateAuthenticatedUser,
    enable: !polledAuthenticatedUser?.isActive,
    delay: 5000,
  });

  return { polledAuthenticatedUser };
};

export default usePolledAuthenticatedUser;
