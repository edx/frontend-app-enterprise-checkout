import { getConfig } from '@edx/frontend-platform/config';
import { act, render } from '@testing-library/react';
import { useEffect } from 'react';
import { MemoryRouter, useNavigate } from 'react-router-dom';

import useTrackCheckoutStepViewed from '@/components/app/data/hooks/useTrackCheckoutStepViewed';
import EVENT_NAMES, { CHECKOUT_EVENT_STEPS } from '@/constants/events';
import { sendCheckoutEvent } from '@/utils/checkoutEvents';

const mockProduct = { category: 'subscription', name: 'teams', brand: 'enterprise' };

jest.mock('@/components/app/data/hooks/useCheckoutEventProductProperties', () => jest.fn(() => mockProduct));

jest.mock('@/utils/checkoutEvents', () => ({
  ...jest.requireActual('@/utils/checkoutEvents'),
  sendCheckoutEvent: jest.fn(),
}));

jest.mock('@edx/frontend-platform/config', () => ({
  getConfig: jest.fn(),
}));

let navigateRef: ReturnType<typeof useNavigate>;

const HookConsumer = ({ isActive = true, isEntryStep = true }: { isActive?: boolean, isEntryStep?: boolean }) => {
  const navigate = useNavigate();
  useEffect(() => { navigateRef = navigate; }, [navigate]);
  useTrackCheckoutStepViewed({
    eventName: EVENT_NAMES.CHECKOUT.STEP_VIEWED_PLAN_DETAILS,
    step: CHECKOUT_EVENT_STEPS.PLAN_DETAILS,
    isActive,
    isEntryStep,
  });
  return null;
};

const renderHookConsumer = (props = {}) => render(
  <MemoryRouter initialEntries={['/plan-details']}>
    <HookConsumer {...props} />
  </MemoryRouter>,
);

const eventNamesSent = () => (sendCheckoutEvent as jest.Mock).mock.calls.map(([{ eventName }]) => eventName);

describe('useTrackCheckoutStepViewed', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
    (getConfig as jest.Mock).mockReturnValue({ FEATURE_SSP_CHECKOUT_SEGMENT_EVENTS_V2: 'true' });
  });

  it('fires checkout_started and step_viewed on the first view of the entry step', () => {
    renderHookConsumer();
    expect(eventNamesSent()).toEqual([
      EVENT_NAMES.CHECKOUT.CHECKOUT_STARTED,
      EVENT_NAMES.CHECKOUT.STEP_VIEWED_PLAN_DETAILS,
    ]);
    expect(sendCheckoutEvent).toHaveBeenCalledWith({
      eventName: EVENT_NAMES.CHECKOUT.STEP_VIEWED_PLAN_DETAILS,
      product: mockProduct,
      step: CHECKOUT_EVENT_STEPS.PLAN_DETAILS,
    });
  });

  it('does not re-fire on re-render of the same visit', () => {
    const { rerender } = renderHookConsumer();
    rerender(
      <MemoryRouter initialEntries={['/plan-details']}>
        <HookConsumer />
      </MemoryRouter>,
    );
    expect(eventNamesSent()).toHaveLength(2);
  });

  it('fires step_viewed again on a repeat visit but checkout_started only once per session', () => {
    renderHookConsumer();
    act(() => { navigateRef('/plan-details'); });
    expect(eventNamesSent()).toEqual([
      EVENT_NAMES.CHECKOUT.CHECKOUT_STARTED,
      EVENT_NAMES.CHECKOUT.STEP_VIEWED_PLAN_DETAILS,
      EVENT_NAMES.CHECKOUT.STEP_VIEWED_PLAN_DETAILS,
    ]);
  });

  it('does not fire while the step is inactive', () => {
    renderHookConsumer({ isActive: false });
    expect(sendCheckoutEvent).not.toHaveBeenCalled();
  });

  it('does not claim checkout_started when the feature flag is disabled', () => {
    (getConfig as jest.Mock).mockReturnValue({});
    renderHookConsumer();
    expect(eventNamesSent()).toEqual([EVENT_NAMES.CHECKOUT.STEP_VIEWED_PLAN_DETAILS]);
    expect(sessionStorage.getItem('edx.checkout.started')).toBeNull();
  });
});
