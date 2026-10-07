import { act, render } from '@testing-library/react';
import { useEffect } from 'react';
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom';

import useOncePerLocationKey from '@/components/app/data/hooks/useOncePerLocationKey';

const onFire = jest.fn();
let navigateRef: ReturnType<typeof useNavigate>;

const HookConsumer = ({ activeOn = '/login' }: { activeOn?: string }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  useEffect(() => { navigateRef = navigate; }, [navigate]);
  useOncePerLocationKey(pathname === activeOn, onFire);
  return null;
};

const renderAt = (path: string) => render(
  <MemoryRouter initialEntries={[path]}><HookConsumer /></MemoryRouter>,
);

describe('useOncePerLocationKey', () => {
  beforeEach(() => jest.clearAllMocks());

  it('fires once per location key while active, not on re-render', () => {
    const { rerender } = renderAt('/login');
    rerender(<MemoryRouter initialEntries={['/login']}><HookConsumer /></MemoryRouter>);
    expect(onFire).toHaveBeenCalledTimes(1);

    act(() => { navigateRef('/login'); });
    expect(onFire).toHaveBeenCalledTimes(2);
  });

  it('does not fire while inactive', () => {
    renderAt('/plan-details');
    expect(onFire).not.toHaveBeenCalled();
  });

  it('fires again when browser Back returns after the hook was inactive', () => {
    renderAt('/login');
    act(() => { navigateRef('/plan-details'); });
    act(() => { navigateRef(-1); }); // Back restores the original history entry and its location key
    expect(onFire).toHaveBeenCalledTimes(2);
  });
});
