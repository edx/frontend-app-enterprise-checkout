import { getConfig } from '@edx/frontend-platform/config';
import { act, render } from '@testing-library/react';
import { useEffect } from 'react';
import { MemoryRouter, useNavigate } from 'react-router-dom';

import useTrackCheckoutStepViewed from '@/components/app/data/hooks/useTrackCheckoutStepViewed';
import EVENT_NAMES, { CHECKOUT_EVENT_STEPS } from '@/constants/events';
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
let navigateRef: ReturnType<typeof useNavigate>;

const HookConsumer = ({
  isActive = true,
  isEntryStep = true,
}: { isActive?: boolean, isEntryStep?: boolean }) => {
  const navigate = useNavigate();
  useEffect(() => { navigateRef = navigate; }, [navigate]);
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
    (getConfig as jest.Mock).mockReturnValue({ FEATURE_SSP_CHECKOUT_SEGMENT_EVENTS_V2: 'true' });
  });

  it('fires checkout_started and step_viewed on the first view, with product and step', () => {
    renderHookConsumer();
    expect(sentEventNames()).toEqual([CHECKOUT_STARTED, STEP_VIEWED_PLAN_DETAILS]);
    expect(sendCheckoutEvent).toHaveBeenLastCalledWith({
      eventName: STEP_VIEWED_PLAN_DETAILS, product: mockProduct, step: CHECKOUT_EVENT_STEPS.PLAN_DETAILS,
    });
  });

  it('fires checkout_started only once across repeat visits to the entry step', () => {
    renderHookConsumer();
    act(() => { navigateRef('/plan-details'); });
    expect(sentEventNames()).toEqual([CHECKOUT_STARTED, STEP_VIEWED_PLAN_DETAILS, STEP_VIEWED_PLAN_DETAILS]);
  });

  it('does not fire checkout_started for a step that is not the entry step', () => {
    render(<MemoryRouter initialEntries={['/plan-details']}><HookConsumer isEntryStep={false} /></MemoryRouter>);
    expect(sentEventNames()).toEqual([STEP_VIEWED_PLAN_DETAILS]);
    expect(sessionStorage.getItem('edx.checkout.started')).toBeNull();
  });

  it('does not fire while the step is inactive', () => {
    renderHookConsumer(false);
    expect(sendCheckoutEvent).not.toHaveBeenCalled();
  });

  it('does not claim checkout_started when the feature flag is disabled', () => {
    (getConfig as jest.Mock).mockReturnValue({});
    renderHookConsumer();
    expect(sentEventNames()).toEqual([STEP_VIEWED_PLAN_DETAILS]);
    expect(sessionStorage.getItem('edx.checkout.started')).toBeNull();
  });
});
