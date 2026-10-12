import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Calls `onFire` once per router location key while `isActive`, so re-renders don't repeat it.
 * Resets when inactive, so browser Back (which restores the same location key) fires again.
 */
const useOncePerLocationKey = (isActive: boolean, onFire: () => void) => {
  const { key: locationKey } = useLocation();
  const lastFiredLocationKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isActive) {
      lastFiredLocationKeyRef.current = null;
      return;
    }
    if (lastFiredLocationKeyRef.current === locationKey) {
      return;
    }
    lastFiredLocationKeyRef.current = locationKey;
    onFire();
  }, [isActive, locationKey, onFire]);
};

export default useOncePerLocationKey;
