import { logError } from '@edx/frontend-platform/logging';

import { CheckoutStepKey, CheckoutSubstepKey } from '@/constants/checkout';
import EVENT_NAMES from '@/constants/events';
import { sendEnterpriseCheckoutTrackingEvent } from '@/utils/common';

import { trackFieldBlur } from '../useFieldTracking';

// Mock dependencies
jest.mock('@edx/frontend-platform/logging');
jest.mock('@/utils/common', () => ({
  sendEnterpriseCheckoutTrackingEvent: jest.fn(),
}));

describe('trackFieldBlur', () => {
  const mockSendEvent = sendEnterpriseCheckoutTrackingEvent as jest.MockedFunction<
    typeof sendEnterpriseCheckoutTrackingEvent
  >;
  const mockLogError = logError as jest.MockedFunction<typeof logError>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should default checkoutIntentId to null if not provided', () => {
    trackFieldBlur({
      fieldName: 'testField',
      step: CheckoutStepKey.PlanDetails,
      checkoutIntentId: null,
    });

    expect(mockSendEvent).toHaveBeenCalledWith({
      checkoutIntentId: null,
      eventName: EVENT_NAMES.SUBSCRIPTION_CHECKOUT.CHECKOUT_FIELD_BLURRED,
      properties: {
        step: CheckoutStepKey.PlanDetails,
        field_name: 'testField',
      },
    });
  });

  it('should send tracking event with correct properties', () => {
    trackFieldBlur({
      fieldName: 'fullName',
      step: CheckoutStepKey.PlanDetails,
      checkoutIntentId: 456,
      additionalProperties: { plan_type: 'teams' },
    });

    // Verify tracking event was sent with correct parameters
    expect(mockSendEvent).toHaveBeenCalledTimes(1);
    expect(mockSendEvent).toHaveBeenCalledWith({
      checkoutIntentId: 456,
      eventName: EVENT_NAMES.SUBSCRIPTION_CHECKOUT.CHECKOUT_FIELD_BLURRED,
      properties: {
        step: CheckoutStepKey.PlanDetails,
        field_name: 'fullName',
        plan_type: 'teams',
      },
    });
  });

  it('should handle null checkoutIntentId', () => {
    trackFieldBlur({
      fieldName: 'email',
      step: CheckoutSubstepKey.Register,
      checkoutIntentId: null,
    });

    expect(mockSendEvent).toHaveBeenCalledWith({
      checkoutIntentId: null,
      eventName: EVENT_NAMES.SUBSCRIPTION_CHECKOUT.CHECKOUT_FIELD_BLURRED,
      properties: {
        step: CheckoutSubstepKey.Register,
        field_name: 'email',
      },
    });
  });

  it('should merge additional properties correctly', () => {
    trackFieldBlur({
      fieldName: 'urlSlug',
      step: CheckoutStepKey.AccountDetails,
      checkoutIntentId: 789,
      additionalProperties: {
        plan_type: 'teams',
        org_slug: 'my-org',
        user_id: 42,
      },
    });

    expect(mockSendEvent).toHaveBeenCalledWith({
      checkoutIntentId: 789,
      eventName: EVENT_NAMES.SUBSCRIPTION_CHECKOUT.CHECKOUT_FIELD_BLURRED,
      properties: {
        step: CheckoutStepKey.AccountDetails,
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

    // Should not throw error
    expect(() => trackFieldBlur({
      fieldName: 'password',
      step: CheckoutSubstepKey.Register,
      checkoutIntentId: 123,
      additionalProperties: { interaction: 'blur' },
    })).not.toThrow();

    // Verify error was logged
    expect(mockLogError).toHaveBeenCalledTimes(1);
    expect(mockLogError).toHaveBeenCalledWith(
      `Failed to send tracking event for field: password on step: ${CheckoutSubstepKey.Register}`,
      mockError,
    );
  });

  it('should call tracking event multiple times when function is called multiple times', () => {
    const params = {
      fieldName: 'testField',
      step: CheckoutStepKey.PlanDetails,
      checkoutIntentId: 100,
    };

    // Call function 3 times
    trackFieldBlur(params);
    trackFieldBlur(params);
    trackFieldBlur(params);

    expect(mockSendEvent).toHaveBeenCalledTimes(3);
  });

  it('should work without additional properties', () => {
    trackFieldBlur({
      fieldName: 'username',
      step: CheckoutSubstepKey.Register,
      checkoutIntentId: 200,
    });

    expect(mockSendEvent).toHaveBeenCalledWith({
      checkoutIntentId: 200,
      eventName: EVENT_NAMES.SUBSCRIPTION_CHECKOUT.CHECKOUT_FIELD_BLURRED,
      properties: {
        step: CheckoutSubstepKey.Register,
        field_name: 'username',
      },
    });
  });

  it('should include substep in properties when provided', () => {
    trackFieldBlur({
      fieldName: 'quantity',
      step: CheckoutStepKey.PlanDetails,
      substep: CheckoutSubstepKey.Login,
      checkoutIntentId: 123,
    });

    expect(mockSendEvent).toHaveBeenCalledWith({
      checkoutIntentId: 123,
      eventName: EVENT_NAMES.SUBSCRIPTION_CHECKOUT.CHECKOUT_FIELD_BLURRED,
      properties: {
        step: CheckoutStepKey.PlanDetails,
        substep: CheckoutSubstepKey.Login,
        field_name: 'quantity',
      },
    });
  });

  it('should omit substep from properties when not provided', () => {
    trackFieldBlur({
      fieldName: 'quantity',
      step: CheckoutStepKey.PlanDetails,
      checkoutIntentId: 123,
    });

    const calledProperties = mockSendEvent.mock.calls[0][0].properties;
    expect(calledProperties).not.toHaveProperty('substep');
  });

  it('should strip password value from additionalProperties', () => {
    trackFieldBlur({
      fieldName: 'password',
      step: CheckoutSubstepKey.Register,
      checkoutIntentId: 123,
      additionalProperties: { password: 'secret123', plan_type: 'teams' },
    });

    const calledProperties = mockSendEvent.mock.calls[0][0].properties;
    expect(calledProperties).not.toHaveProperty('password');
    expect(calledProperties).toHaveProperty('plan_type', 'teams');
  });

  it('should strip adminEmail value from additionalProperties', () => {
    trackFieldBlur({
      fieldName: 'adminEmail',
      step: CheckoutStepKey.PlanDetails,
      checkoutIntentId: 123,
      additionalProperties: { adminEmail: 'user@example.com', plan_type: 'teams' },
    });

    const calledProperties = mockSendEvent.mock.calls[0][0].properties;
    expect(calledProperties).not.toHaveProperty('adminEmail');
    expect(calledProperties).toHaveProperty('plan_type', 'teams');
  });
});
