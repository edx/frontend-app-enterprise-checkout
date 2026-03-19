import { logError } from '@edx/frontend-platform/logging';
import { act, renderHook } from '@testing-library/react';

import EVENT_NAMES from '@/constants/events';
import { sendEnterpriseCheckoutTrackingEvent } from '@/utils/common';

import { useDebounceTracking } from '../useDebounceTracking';

// Mock dependencies
jest.mock('@edx/frontend-platform/logging');
jest.mock('@/utils/common', () => ({
  sendEnterpriseCheckoutTrackingEvent: jest.fn(),
}));

describe('useDebounceTracking', () => {
  const mockSendEvent = sendEnterpriseCheckoutTrackingEvent as jest.MockedFunction<
    typeof sendEnterpriseCheckoutTrackingEvent
  >;
  const mockLogError = logError as jest.MockedFunction<typeof logError>;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should return a blur handler function', () => {
    const { result } = renderHook(() => useDebounceTracking({
      fieldName: 'urlSlug',
      step: 'account_details',
      checkoutIntentId: 123,
    }));

    expect(typeof result.current).toBe('function');
  });

  it('should debounce tracking event with default 500ms delay', () => {
    const { result } = renderHook(() => useDebounceTracking({
      fieldName: 'urlSlug',
      step: 'account_details',
      checkoutIntentId: 456,
      additionalProperties: { plan_type: 'teams', org_slug: 'my-org' },
    }));

    // Call blur handler
    act(() => {
      result.current();
    });

    // Event should NOT be sent immediately
    expect(mockSendEvent).not.toHaveBeenCalled();

    // Fast-forward time by 499ms (just before threshold)
    act(() => {
      jest.advanceTimersByTime(499);
    });

    // Event still should not be sent
    expect(mockSendEvent).not.toHaveBeenCalled();

    // Fast-forward the remaining 1ms to reach 500ms total
    act(() => {
      jest.advanceTimersByTime(1);
    });

    // Now event should be sent
    expect(mockSendEvent).toHaveBeenCalledTimes(1);
    expect(mockSendEvent).toHaveBeenCalledWith({
      checkoutIntentId: 456,
      eventName: EVENT_NAMES.SUBSCRIPTION_CHECKOUT.CHECKOUT_FIELD_BLURRED,
      properties: {
        step: 'account_details',
        field_name: 'urlSlug',
        plan_type: 'teams',
        org_slug: 'my-org',
      },
    });
  });

  it('should debounce tracking event with custom delay', () => {
    const { result } = renderHook(() => useDebounceTracking({
      fieldName: 'customField',
      step: 'plan_details',
      checkoutIntentId: 789,
      debounceMs: 1000,
    }));

    act(() => {
      result.current();
    });

    expect(mockSendEvent).not.toHaveBeenCalled();

    // Fast-forward by 500ms (default delay) - should not fire
    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(mockSendEvent).not.toHaveBeenCalled();

    // Fast-forward remaining 500ms to reach 1000ms
    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(mockSendEvent).toHaveBeenCalledTimes(1);
  });

  it('should cancel previous timeout when called multiple times rapidly', () => {
    const { result } = renderHook(() => useDebounceTracking({
      fieldName: 'urlSlug',
      step: 'account_details',
      checkoutIntentId: 100,
      debounceMs: 500,
    }));

    // Call blur handler 3 times rapidly
    act(() => {
      result.current();
    });

    act(() => {
      jest.advanceTimersByTime(200);
    });

    act(() => {
      result.current();
    });

    act(() => {
      jest.advanceTimersByTime(200);
    });

    act(() => {
      result.current();
    });

    // Fast-forward 499ms from the last call
    act(() => {
      jest.advanceTimersByTime(499);
    });

    // Should still not have fired
    expect(mockSendEvent).not.toHaveBeenCalled();

    // Fast-forward 1 more ms to complete the 500ms from last call
    act(() => {
      jest.advanceTimersByTime(1);
    });

    // Should only fire once (the last call)
    expect(mockSendEvent).toHaveBeenCalledTimes(1);
  });

  it('should handle null checkoutIntentId', () => {
    const { result } = renderHook(() => useDebounceTracking({
      fieldName: 'testField',
      step: 'registration',
      checkoutIntentId: null,
    }));

    act(() => {
      result.current();
    });

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(mockSendEvent).toHaveBeenCalledWith({
      checkoutIntentId: null,
      eventName: EVENT_NAMES.SUBSCRIPTION_CHECKOUT.CHECKOUT_FIELD_BLURRED,
      properties: {
        step: 'registration',
        field_name: 'testField',
      },
    });
  });

  it('should handle tracking event errors gracefully with logError', () => {
    const mockError = new Error('Debounced tracking failed');
    mockSendEvent.mockImplementation(() => {
      throw mockError;
    });

    const { result } = renderHook(() => useDebounceTracking({
      fieldName: 'urlSlug',
      step: 'account_details',
      checkoutIntentId: 200,
    }));

    act(() => {
      result.current();
    });

    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Should not throw error
    expect(mockLogError).toHaveBeenCalledTimes(1);
    expect(mockLogError).toHaveBeenCalledWith(
      'Failed to send debounced tracking event for field: urlSlug',
      mockError,
    );
  });

  it('should cleanup timeout on unmount', () => {
    const { result, unmount } = renderHook(() => useDebounceTracking({
      fieldName: 'urlSlug',
      step: 'account_details',
      checkoutIntentId: 300,
    }));

    act(() => {
      result.current();
    });

    // Unmount before timeout completes
    unmount();

    // Fast-forward past the debounce delay
    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Event should NOT be sent because component unmounted
    expect(mockSendEvent).not.toHaveBeenCalled();
  });

  it('should work without additional properties', () => {
    const { result } = renderHook(() => useDebounceTracking({
      fieldName: 'simpleField',
      step: 'plan_details',
      checkoutIntentId: 400,
    }));

    act(() => {
      result.current();
    });

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(mockSendEvent).toHaveBeenCalledWith({
      checkoutIntentId: 400,
      eventName: EVENT_NAMES.SUBSCRIPTION_CHECKOUT.CHECKOUT_FIELD_BLURRED,
      properties: {
        step: 'plan_details',
        field_name: 'simpleField',
      },
    });
  });

  it('should create new handler when called with new object reference for additionalProperties', () => {
    const { result, rerender } = renderHook(
      ({ props }) => useDebounceTracking({
        fieldName: 'urlSlug',
        step: 'account_details',
        checkoutIntentId: 500,
        debounceMs: 500,
        additionalProperties: props,
      }),
      { initialProps: { props: { plan_type: 'teams' } } },
    );

    const firstHandler = result.current;

    // Re-render with new object reference but same content
    rerender({ props: { plan_type: 'teams' } });

    const secondHandler = result.current;

    // Handler reference will change because additionalProperties object changed reference
    // This is expected behavior with useCallback and object dependencies
    expect(firstHandler).not.toBe(secondHandler);
  });

  it('should update handler when parameters change', () => {
    const { result, rerender } = renderHook(
      ({ fieldName }) => useDebounceTracking({
        fieldName,
        step: 'account_details',
        checkoutIntentId: 600,
        debounceMs: 500,
      }),
      { initialProps: { fieldName: 'field1' } },
    );

    const firstHandler = result.current;

    act(() => {
      firstHandler();
    });

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(mockSendEvent).toHaveBeenLastCalledWith(
      expect.objectContaining({
        properties: expect.objectContaining({
          field_name: 'field1',
        }),
      }),
    );

    mockSendEvent.mockClear();

    // Re-render with different fieldName
    rerender({ fieldName: 'field2' });

    const secondHandler = result.current;

    // Handler reference should change
    expect(firstHandler).not.toBe(secondHandler);

    act(() => {
      secondHandler();
    });

    act(() => {
      jest.advanceTimersByTime(500);
    });

    // New handler should send updated field name
    expect(mockSendEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        properties: expect.objectContaining({
          field_name: 'field2',
        }),
      }),
    );
  });

  it('should allow multiple completed debounce cycles', () => {
    const { result } = renderHook(() => useDebounceTracking({
      fieldName: 'urlSlug',
      step: 'account_details',
      checkoutIntentId: 700,
      debounceMs: 300,
    }));

    // First blur
    act(() => {
      result.current();
    });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(mockSendEvent).toHaveBeenCalledTimes(1);

    // Second blur after timeout completed
    act(() => {
      result.current();
    });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(mockSendEvent).toHaveBeenCalledTimes(2);

    // Third blur
    act(() => {
      result.current();
    });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(mockSendEvent).toHaveBeenCalledTimes(3);
  });
});
