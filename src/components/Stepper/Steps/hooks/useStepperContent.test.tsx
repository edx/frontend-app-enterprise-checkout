import { render, renderHook } from '@testing-library/react';

import useStepperContent from '@/components/Stepper/Steps/hooks/useStepperContent';
import useCurrentPage from '@/hooks/useCurrentPage';

jest.mock('@/hooks/useCurrentPage');

const mockedUseCurrentPage = useCurrentPage as jest.Mock;

describe('useStepperContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns a stable empty component when currentPage is null', () => {
    mockedUseCurrentPage.mockReturnValue(null);

    const { result, rerender } = renderHook(() => useStepperContent());
    const firstFallback = result.current;

    rerender();

    expect(result.current).toBe(firstFallback);
  });

  it('falls back to an empty component when currentPage is unmapped', () => {
    mockedUseCurrentPage.mockReturnValue('UnexpectedPage');

    const { result, rerender } = renderHook(() => useStepperContent());
    const Fallback = result.current;

    rerender();

    expect(Fallback).toBeDefined();
    expect(result.current).toBe(Fallback);
    expect(() => render(<Fallback />)).not.toThrow();
  });
});
