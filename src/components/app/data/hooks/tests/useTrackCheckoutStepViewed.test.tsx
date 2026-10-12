import { getConfig } from '@edx/frontend-platform/config';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import useTrackCheckoutStepViewed from '@/components/app/data/hooks/useTrackCheckoutStepViewed';
import EVENT_NAMES, { CHECKOUT_EVENT_STEPS } from '@/constants/events';
import { useCheckoutStartedStore } from '@/hooks/checkoutSessionStorage';
import { sendCheckoutEvent } from '@/utils/checkoutEvents';

const mockProduct = {
  category: 'subscription', name: 'teams', brand: 'enterprise', payment_schedule: 'yearly',
} as const;
jest.mock('@/utils/checkoutEvents', () => ({
  ...jest.requireActual('@/utils/checkoutEvents'),
  sendCheckoutEvent: jest.fn(),
}));
jest.mock('@edx/frontend-platform/config', () => ({ getConfig: jest.fn() }));

const { CHECKOUT_STARTED, STEP_VIEWED_PLAN_DETAILS } = EVENT_NAMES.CHECKOUT;

const HookConsumer = ({
  isActive = true,
  isEntryStep = true,
}: { isActive?: boolean, isEntryStep?: boolean }) => {
  useTrackCheckoutStepViewed({
    eventName: STEP_VIEWED_PLAN_DETAILS,
    step: CHECKOUT_EVENT_STEPS.PLAN_DETAILS,
    product: mockProduct,
    isActive,
    ...(isEntryStep ? { isEntryStep } : {}),
  });
  return null;
};

const renderHookConsumer = (isActive = true) => render(
  <MemoryRouter initialEntries={['/plan-details']}><HookConsumer isActive={isActive} /></MemoryRouter>,
);
const sentEventNames = () => (sendCheckoutEvent as jest.Mock).mock.calls.map(([{ eventName }]) => eventName);

describe('useTrackCheckoutStepViewed', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
    useCheckoutStartedStore.setState({ started: false });
    (getConfig as jest.Mock).mockReturnValue({ FEATURE_SSP_CHECKOUT_SEGMENT_EVENTS_V2: 'true' });
  });

  // The underlying re-fire-per-location-key/dedup-on-re-render/reset-on-inactive mechanics are
  // exercised directly in useOncePerLocationKey.test.tsx — this hook now has zero custom logic
  // around *when* onFire runs, so only its own compound-dispatch behavior is tested here.

  it('fires checkout_started and step_viewed on the first view, with product and step', () => {
    renderHookConsumer();
    expect(sentEventNames()).toEqual([CHECKOUT_STARTED, STEP_VIEWED_PLAN_DETAILS]);
    expect(sendCheckoutEvent).toHaveBeenLastCalledWith({
      eventName: STEP_VIEWED_PLAN_DETAILS, product: mockProduct, step: CHECKOUT_EVENT_STEPS.PLAN_DETAILS,
    });
  });

  it('does not fire checkout_started for a step that is not the entry step', () => {
    render(<MemoryRouter initialEntries={['/plan-details']}><HookConsumer isEntryStep={false} /></MemoryRouter>);
    expect(sentEventNames()).toEqual([STEP_VIEWED_PLAN_DETAILS]);
    expect(useCheckoutStartedStore.getState().started).toBe(false);
  });

  it('does not claim checkout_started when the feature flag is disabled', () => {
    (getConfig as jest.Mock).mockReturnValue({});
    renderHookConsumer();
    expect(sentEventNames()).toEqual([STEP_VIEWED_PLAN_DETAILS]);
    expect(useCheckoutStartedStore.getState().started).toBe(false);
  });
});
