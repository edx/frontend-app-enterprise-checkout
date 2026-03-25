import { logError } from '@edx/frontend-platform/logging';

import EVENT_NAMES from '@/constants/events';
import { CheckoutStepKey, CheckoutSubstepKey } from '@/constants/checkout';
import { sendEnterpriseCheckoutTrackingEvent } from '@/utils/common';

import { trackDebouncedFieldBlur } from '../useDebounceTrackFieldBlur';

// Mock dependencies
jest.mock('@edx/frontend-platform/logging');
jest.mock('@/utils/common', () => ({
  sendEnterpriseCheckoutTrackingEvent: jest.fn(),
}));

describe('trackDebouncedFieldBlur', () => {
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

  it('should debounce tracking event with default 500ms delay', () => {
    trackDebouncedFieldBlur({
      fieldName: 'urlSlug',
      step: CheckoutStepKey.AccountDetails,
      checkoutIntentId: 456,
      additionalProperties: { plan_type: 'teams', org_slug: 'my-org' },
    });

    // Event should NOT be sent immediately
    expect(mockSendEvent).not.toHaveBeenCalled();

    // Fast-forward time by 499ms (just before threshold)
    jest.advanceTimersByTime(499);

    // Event still should not be sent
    expect(mockSendEvent).not.toHaveBeenCalled();

    // Fast-forward the remaining 1ms to reach 500ms total
    jest.advanceTimersByTime(1);

    // Now event should be sent
    expect(mockSendEvent).toHaveBeenCalledTimes(1);
    expect(mockSendEvent).toHaveBeenCalledWith({
      checkoutIntentId: 456,
      eventName: EVENT_NAMES.SUBSCRIPTION_CHECKOUT.CHECKOUT_FIELD_BLURRED,
      properties: {
        step: CheckoutStepKey.AccountDetails,
        field_name: 'urlSlug',
        plan_type: 'teams',
        org_slug: 'my-org',
      },
    });
  });

  it('should debounce tracking event with custom delay', () => {
    trackDebouncedFieldBlur({
      fieldName: 'customField',
      step: CheckoutStepKey.PlanDetails,
      checkoutIntentId: 789,
      debounceMs: 1000,
    });

    expect(mockSendEvent).not.toHaveBeenCalled();

    // Fast-forward by 500ms (default delay) - should not fire
    jest.advanceTimersByTime(500);

    expect(mockSendEvent).not.toHaveBeenCalled();

    // Fast-forward remaining 500ms to reach 1000ms
    jest.advanceTimersByTime(500);

    expect(mockSendEvent).toHaveBeenCalledTimes(1);
  });

  it('should cancel previous timeout when called multiple times rapidly', () => {
    // Call 3 times rapidly
    trackDebouncedFieldBlur({
      fieldName: 'urlSlug',
      step: CheckoutStepKey.AccountDetails,
      checkoutIntentId: 100,
      debounceMs: 500,
    });

    jest.advanceTimersByTime(200);

    trackDebouncedFieldBlur({
      fieldName: 'urlSlug',
      step: CheckoutStepKey.AccountDetails,
      checkoutIntentId: 100,
      debounceMs: 500,
    });

    jest.advanceTimersByTime(200);

    trackDebouncedFieldBlur({
      fieldName: 'urlSlug',
      step: CheckoutStepKey.AccountDetails,
      checkoutIntentId: 100,
      debounceMs: 500,
    });

    // Fast-forward 499ms from the last call
    jest.advanceTimersByTime(499);

    // Should still not have fired
    expect(mockSendEvent).not.toHaveBeenCalled();

    // Fast-forward 1 more ms to complete the 500ms from last call
    jest.advanceTimersByTime(1);

    // Should only fire once (the last call)
    expect(mockSendEvent).toHaveBeenCalledTimes(1);
  });

  it('should handle null checkoutIntentId', () => {
    trackDebouncedFieldBlur({
      fieldName: 'testField',
      step: CheckoutSubstepKey.Register,
      checkoutIntentId: null,
    });

    jest.advanceTimersByTime(500);

    expect(mockSendEvent).toHaveBeenCalledWith({
      checkoutIntentId: null,
      eventName: EVENT_NAMES.SUBSCRIPTION_CHECKOUT.CHECKOUT_FIELD_BLURRED,
      properties: {
        step: CheckoutSubstepKey.Register,
        field_name: 'testField',
      },
    });
  });

  it('should handle tracking event errors gracefully with logError', () => {
    const mockError = new Error('Debounced tracking failed');
    mockSendEvent.mockImplementation(() => {
      throw mockError;
    });

    trackDebouncedFieldBlur({
      fieldName: 'urlSlug',
      step: CheckoutStepKey.AccountDetails,
      checkoutIntentId: 200,
    });

    jest.advanceTimersByTime(500);

    // Should not throw error
    expect(mockLogError).toHaveBeenCalledTimes(1);
    expect(mockLogError).toHaveBeenCalledWith(
      'Failed to send debounced tracking event for field: urlSlug',
      mockError,
    );
  });

  it('should work without additional properties', () => {
    trackDebouncedFieldBlur({
      fieldName: 'simpleField',
      step: CheckoutStepKey.PlanDetails,
      checkoutIntentId: 400,
    });

    jest.advanceTimersByTime(500);

    expect(mockSendEvent).toHaveBeenCalledWith({
      checkoutIntentId: 400,
      eventName: EVENT_NAMES.SUBSCRIPTION_CHECKOUT.CHECKOUT_FIELD_BLURRED,
      properties: {
        step: CheckoutStepKey.PlanDetails,
        field_name: 'simpleField',
      },
    });
  });

  it('should allow multiple completed debounce cycles', () => {
    // First blur
    trackDebouncedFieldBlur({
      fieldName: 'urlSlug',
      step: CheckoutStepKey.AccountDetails,
      checkoutIntentId: 700,
      debounceMs: 300,
    });

    jest.advanceTimersByTime(300);

    expect(mockSendEvent).toHaveBeenCalledTimes(1);

    // Second blur after timeout completed
    trackDebouncedFieldBlur({
      fieldName: 'urlSlug',
      step: CheckoutStepKey.AccountDetails,
      checkoutIntentId: 700,
      debounceMs: 300,
    });

    jest.advanceTimersByTime(300);

    expect(mockSendEvent).toHaveBeenCalledTimes(2);

    // Third blur
    trackDebouncedFieldBlur({
      fieldName: 'urlSlug',
      step: CheckoutStepKey.AccountDetails,
      checkoutIntentId: 700,
      debounceMs: 300,
    });

    jest.advanceTimersByTime(300);

    expect(mockSendEvent).toHaveBeenCalledTimes(3);
  });
});
