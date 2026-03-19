import { logError } from '@edx/frontend-platform/logging';
import { renderHook } from '@testing-library/react';

import { TRACKING_EVENT_NAMES } from '@/constants/tracking';
import { sendEnterpriseCheckoutTrackingEvent } from '@/utils/common';

import { useFieldTracking } from '../useFieldTracking';

// Mock dependencies
jest.mock('@edx/frontend-platform/logging');
jest.mock('@/utils/common', () => ({
  sendEnterpriseCheckoutTrackingEvent: jest.fn(),
}));

describe('useFieldTracking', () => {
  const mockSendEvent = sendEnterpriseCheckoutTrackingEvent as jest.MockedFunction<
    typeof sendEnterpriseCheckoutTrackingEvent
  >;
  const mockLogError = logError as jest.MockedFunction<typeof logError>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return a blur handler function', () => {
    const { result } = renderHook(() => useFieldTracking({
      fieldName: 'testField',
      step: 'plan_details',
      checkoutIntentId: 123,
    }));

    expect(typeof result.current).toBe('function');
  });

  it('should send tracking event with correct properties on blur', () => {
    const { result } = renderHook(() => useFieldTracking({
      fieldName: 'fullName',
      step: 'plan_details',
      checkoutIntentId: 456,
      additionalProperties: { plan_type: 'teams' },
    }));

    // Call the returned blur handler
    result.current();

    // Verify tracking event was sent with correct parameters
    expect(mockSendEvent).toHaveBeenCalledTimes(1);
    expect(mockSendEvent).toHaveBeenCalledWith({
      checkoutIntentId: 456,
      eventName: TRACKING_EVENT_NAMES.CHECKOUT_FIELD_BLUR,
      properties: {
        step: 'plan_details',
        field_name: 'fullName',
        plan_type: 'teams',
      },
    });
  });

  it('should handle null checkoutIntentId', () => {
    const { result } = renderHook(() => useFieldTracking({
      fieldName: 'email',
      step: 'registration',
      checkoutIntentId: null,
    }));

    result.current();

    expect(mockSendEvent).toHaveBeenCalledWith({
      checkoutIntentId: null,
      eventName: TRACKING_EVENT_NAMES.CHECKOUT_FIELD_BLUR,
      properties: {
        step: 'registration',
        field_name: 'email',
      },
    });
  });

  it('should merge additional properties correctly', () => {
    const { result } = renderHook(() => useFieldTracking({
      fieldName: 'urlSlug',
      step: 'account_details',
      checkoutIntentId: 789,
      additionalProperties: {
        plan_type: 'teams',
        org_slug: 'my-org',
        user_id: 42,
      },
    }));

    result.current();

    expect(mockSendEvent).toHaveBeenCalledWith({
      checkoutIntentId: 789,
      eventName: TRACKING_EVENT_NAMES.CHECKOUT_FIELD_BLUR,
      properties: {
        step: 'account_details',
        field_name: 'urlSlug',
        plan_type: 'teams',
        org_slug: 'my-org',
        user_id: 42,
      },
    });
  });

  it('should handle tracking event errors gracefully with logError', () => {
    const mockError = new Error('Tracking failed');
    mockSendEvent.mockImplementation(() => {
      throw mockError;
    });

    const { result } = renderHook(() => useFieldTracking({
      fieldName: 'password',
      step: 'registration',
      checkoutIntentId: 123,
      additionalProperties: { interaction: 'blur' },
    }));

    // Should not throw error
    expect(() => result.current()).not.toThrow();

    // Verify error was logged
    expect(mockLogError).toHaveBeenCalledTimes(1);
    expect(mockLogError).toHaveBeenCalledWith(
      'Failed to send tracking event for field: password',
      mockError,
    );
  });

  it('should call tracking event multiple times when handler is called multiple times', () => {
    const { result } = renderHook(() => useFieldTracking({
      fieldName: 'testField',
      step: 'plan_details',
      checkoutIntentId: 100,
    }));

    // Call handler 3 times
    result.current();
    result.current();
    result.current();

    expect(mockSendEvent).toHaveBeenCalledTimes(3);
  });

  it('should work without additional properties', () => {
    const { result } = renderHook(() => useFieldTracking({
      fieldName: 'username',
      step: 'registration',
      checkoutIntentId: 200,
    }));

    result.current();

    expect(mockSendEvent).toHaveBeenCalledWith({
      checkoutIntentId: 200,
      eventName: TRACKING_EVENT_NAMES.CHECKOUT_FIELD_BLUR,
      properties: {
        step: 'registration',
        field_name: 'username',
      },
    });
  });

  it('should maintain stable reference when parameters do not change', () => {
    const params = {
      fieldName: 'testField',
      step: 'plan_details',
      checkoutIntentId: 123,
      additionalProperties: { plan_type: 'teams' },
    };

    const { result, rerender } = renderHook(() => useFieldTracking(params));

    const firstHandler = result.current;

    // Re-render with same params
    rerender();

    const secondHandler = result.current;

    // Handler reference should be stable (useCallback working correctly)
    expect(firstHandler).toBe(secondHandler);
  });

  it('should update handler when parameters change', () => {
    const { result, rerender } = renderHook(
      ({ fieldName }) => useFieldTracking({
        fieldName,
        step: 'plan_details',
        checkoutIntentId: 123,
      }),
      { initialProps: { fieldName: 'field1' } },
    );

    const firstHandler = result.current;
    firstHandler();

    expect(mockSendEvent).toHaveBeenLastCalledWith(
      expect.objectContaining({
        properties: expect.objectContaining({
          field_name: 'field1',
        }),
      }),
    );

    // Re-render with different fieldName
    rerender({ fieldName: 'field2' });

    const secondHandler = result.current;
    secondHandler();

    // Handler reference should change
    expect(firstHandler).not.toBe(secondHandler);

    // New handler should send updated field name
    expect(mockSendEvent).toHaveBeenLastCalledWith(
      expect.objectContaining({
        properties: expect.objectContaining({
          field_name: 'field2',
        }),
      }),
    );
  });
});
