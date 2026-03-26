import { sendPageEvent, sendTrackEvent } from '@edx/frontend-platform/analytics';

import { useBFFContext, useCheckoutIntent, useFormValidationConstraints } from '@/components/app/data/hooks';
import { CheckoutPageRoute, CheckoutStepKey, CheckoutSubstepKey } from '@/constants/checkout';
import EVENT_NAMES from '@/constants/events';
import { renderStepperRoute } from '@/utils/tests';

jest.mock('@edx/frontend-platform/analytics', () => ({
  sendTrackEvent: jest.fn(),
  sendPageEvent: jest.fn(),
}));

jest.mock('@edx/frontend-platform/logging', () => ({
  logError: jest.fn(),
  logInfo: jest.fn(),
}));

jest.mock('@/components/app/data/hooks', () => {
  const actual = jest.requireActual('@/components/app/data/hooks');
  return {
    ...actual,
    useFormValidationConstraints: jest.fn(),
    useCheckoutIntent: jest.fn(),
    useBFFContext: jest.fn(),
    useRecaptchaToken: jest.fn().mockReturnValue({ getToken: jest.fn().mockResolvedValue('test-token') }),
  };
});

describe('Telemetry URL Guard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useFormValidationConstraints as jest.Mock).mockReturnValue({
      data: {
        quantity: { min: 5, max: 30 },
      },
    });
    (useCheckoutIntent as jest.Mock).mockReturnValue({
      data: { id: 'test-intent-id' },
    });
    (useBFFContext as jest.Mock).mockImplementation((_userId, options) => {
      const mockData = { checkoutIntent: { id: 'test-intent-id' } };
      const transformedData = options?.select ? options.select(mockData) : mockData;
      return { data: transformedData };
    });
  });

  it('fires only PlanDetails page view event when on PlanDetails route', () => {
    renderStepperRoute(CheckoutPageRoute.PlanDetails);

    // Should fire for PlanDetails
    expect(sendPageEvent).toHaveBeenCalledWith(
      'enterprise_checkout',
      EVENT_NAMES.SUBSCRIPTION_CHECKOUT.CHECKOUT_PAGE_VIEWED,
      expect.objectContaining({
        step: CheckoutStepKey.PlanDetails,
      }),
    );

    // Should NOT fire for AccountDetails
    expect(sendPageEvent).not.toHaveBeenCalledWith(
      'enterprise_checkout',
      EVENT_NAMES.SUBSCRIPTION_CHECKOUT.CHECKOUT_PAGE_VIEWED,
      expect.objectContaining({
        step: CheckoutStepKey.AccountDetails,
      }),
    );
  });

  it('fires only AccountDetails page view event when on AccountDetails route', () => {
    const route = CheckoutPageRoute.AccountDetails;
    renderStepperRoute(route, {
      config: {},
      authenticatedUser: { userId: 123 },
    });

    // Should fire for AccountDetails
    expect(sendPageEvent).toHaveBeenCalledWith(
      'enterprise_checkout',
      EVENT_NAMES.SUBSCRIPTION_CHECKOUT.CHECKOUT_PAGE_VIEWED,
      expect.objectContaining({
        step: CheckoutStepKey.AccountDetails,
      }),
    );

    // Should NOT fire for PlanDetails
    expect(sendPageEvent).not.toHaveBeenCalledWith(
      'enterprise_checkout',
      EVENT_NAMES.SUBSCRIPTION_CHECKOUT.CHECKOUT_PAGE_VIEWED,
      expect.objectContaining({
        step: CheckoutStepKey.PlanDetails,
      }),
    );
  });

  it('fires only Register page view event when on PlanDetailsRegister route', () => {
    renderStepperRoute(CheckoutPageRoute.PlanDetailsRegister);

    // Should fire for Register
    expect(sendPageEvent).toHaveBeenCalledWith(
      'enterprise_checkout',
      EVENT_NAMES.SUBSCRIPTION_CHECKOUT.CHECKOUT_PAGE_VIEWED,
      expect.objectContaining({
        step: CheckoutSubstepKey.Register,
      }),
    );

    // Should NOT fire for AccountDetails
    expect(sendPageEvent).not.toHaveBeenCalledWith(
      'enterprise_checkout',
      EVENT_NAMES.SUBSCRIPTION_CHECKOUT.CHECKOUT_PAGE_VIEWED,
      expect.objectContaining({
        step: CheckoutStepKey.AccountDetails,
      }),
    );
  });
});
