import { logError } from '@edx/frontend-platform/logging';

import { useCheckoutAttributionStore, useCheckoutStartedStore } from '@/hooks/checkoutSessionStorage';

jest.mock('@edx/frontend-platform/logging', () => ({ logError: jest.fn() }));

describe('checkoutSessionStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
    useCheckoutStartedStore.setState({ started: false });
    useCheckoutAttributionStore.setState({ attribution: {}, captured: false });
  });

  describe('useCheckoutStartedStore', () => {
    it('claimStarted() returns true only once', () => {
      expect(useCheckoutStartedStore.getState().claimStarted()).toBe(true);
      expect(useCheckoutStartedStore.getState().claimStarted()).toBe(false);
      expect(useCheckoutStartedStore.getState().started).toBe(true);
    });

    it('persists the claim to sessionStorage under the same key the app has always used', () => {
      useCheckoutStartedStore.getState().claimStarted();
      expect(JSON.parse(sessionStorage.getItem('edx.checkout.started') as string)).toEqual({
        state: { started: true }, version: 0,
      });
    });
  });

  describe('useCheckoutAttributionStore', () => {
    it('setAttribution replaces prior attribution and marks the session as captured', () => {
      useCheckoutAttributionStore.getState().setAttribution({ utm_source: 'google' });
      expect(useCheckoutAttributionStore.getState()).toMatchObject({
        attribution: { utm_source: 'google' }, captured: true,
      });

      useCheckoutAttributionStore.getState().setAttribution({ utm_source: 'linkedin' });
      expect(useCheckoutAttributionStore.getState().attribution).toEqual({ utm_source: 'linkedin' });
    });

    it('marks captured even when the attribution itself is empty (no campaign context)', () => {
      useCheckoutAttributionStore.getState().setAttribution({});
      expect(useCheckoutAttributionStore.getState()).toMatchObject({ attribution: {}, captured: true });
    });
  });

  describe('when sessionStorage.setItem throws (e.g. private browsing or quota exceeded)', () => {
    const storageError = new Error('storage blocked');
    let setItemSpy: jest.SpyInstance;

    beforeEach(() => {
      setItemSpy = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw storageError; });
    });

    afterEach(() => {
      setItemSpy.mockRestore();
    });

    it.each([
      ['useCheckoutStartedStore', () => useCheckoutStartedStore.getState().claimStarted(), true],
      [
        'useCheckoutAttributionStore',
        () => {
          useCheckoutAttributionStore.getState().setAttribution({ utm_source: 'google' });
          return useCheckoutAttributionStore.getState().attribution;
        },
        { utm_source: 'google' },
      ],
    ])('%s: the in-memory write still succeeds and the failed persist is logged, not thrown', (_name, action, expectedResult) => {
      expect(() => {
        const result = action();
        expect(result).toEqual(expectedResult);
      }).not.toThrow();
      expect(logError).toHaveBeenCalledWith(
        expect.stringContaining('Failed to write sessionStorage key edx.checkout.'),
        storageError,
      );
    });
  });

  describe('cold start with a pre-broken sessionStorage.getItem', () => {
    it('initializes with safe defaults instead of throwing during hydration', () => {
      jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('storage blocked'); });

      let freshStartedStore: typeof useCheckoutStartedStore;
      jest.isolateModules(() => {
        // eslint-disable-next-line global-require
        freshStartedStore = require('@/hooks/checkoutSessionStorage').useCheckoutStartedStore;
      });

      expect(freshStartedStore!.getState().started).toBe(false);
      expect(logError).toHaveBeenCalledWith(
        expect.stringContaining('Failed to read sessionStorage key edx.checkout.started'),
        expect.any(Error),
      );

      jest.restoreAllMocks();
    });
  });
});
