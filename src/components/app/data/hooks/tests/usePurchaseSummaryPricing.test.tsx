import { AppContext } from '@edx/frontend-platform/react';
import { keepPreviousData } from '@tanstack/react-query';
import { render, renderHook, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import useBFFContext from '@/components/app/data/hooks/useBFFContext';
import useCheckoutEventProductProperties from '@/components/app/data/hooks/useCheckoutEventProductProperties';
import usePurchaseSummaryPricing, { calculateSubscriptionCost } from '@/components/app/data/hooks/usePurchaseSummaryPricing';
import { DataStoreKey } from '@/constants/checkout';
import { checkoutFormStore } from '@/hooks/useCheckoutFormStore';

// Mock the BFF context hook so we can control the unitAmount value
jest.mock('@/components/app/data/hooks/useBFFContext');

const mockedUseBFFContext = useBFFContext as unknown as jest.Mock;

// Test helper component to consume the hook in a React render
const HookConsumer: React.FC = () => {
  const {
    yearlyCostPerSubscriptionPerUser,
    yearlySubscriptionCostForQuantity,
  } = usePurchaseSummaryPricing();

  return (
    <div>
      <div data-testid="per-user">{String(yearlyCostPerSubscriptionPerUser)}</div>
      <div data-testid="total">{String(yearlySubscriptionCostForQuantity)}</div>
    </div>
  );
};

const renderWithAppContext = (
  ui: React.ReactElement,
  appCtxValue: any = { config: {}, authenticatedUser: { userId: 12345 } },
) => (
  render(
    <AppContext.Provider value={appCtxValue}>
      {ui}
    </AppContext.Provider>,
  )
);

describe('calculateSubscriptionCost (helper)', () => {
  it('returns null values when unitAmount is null/undefined', () => {
    expect(calculateSubscriptionCost(3, null)).toEqual({
      yearlyCostPerSubscriptionPerUser: null,
      yearlySubscriptionCostForQuantity: null,
    });
    expect(calculateSubscriptionCost(3, undefined)).toEqual({
      yearlyCostPerSubscriptionPerUser: null,
      yearlySubscriptionCostForQuantity: null,
    });
  });

  it('computes per-user and total correctly for positive quantity', () => {
    // unitPrice is in dollars
    const result = calculateSubscriptionCost(3, 50);
    expect(result.yearlyCostPerSubscriptionPerUser).toBe(50);
    expect(result.yearlySubscriptionCostForQuantity).toBe(150);
  });

  it('returns total as null when quantity is falsy but still exposes per-user price', () => {
    const result0 = calculateSubscriptionCost(0, 50);
    expect(result0.yearlyCostPerSubscriptionPerUser).toBe(50);
    expect(result0.yearlySubscriptionCostForQuantity).toBeNull();

    const resultNullQty = calculateSubscriptionCost((undefined as unknown) as number, 50);
    expect(resultNullQty.yearlyCostPerSubscriptionPerUser).toBe(50);
    expect(resultNullQty.yearlySubscriptionCostForQuantity).toBeNull();
  });
});

describe('usePurchaseSummaryPricing (hook)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default form store state
    checkoutFormStore.setState((s) => ({
      ...s,
      formData: {
        ...s.formData,
        [DataStoreKey.PlanDetails]: { quantity: 4 },
      },
    }));
  });

  it('uses the stored productLookupKey when selecting price from BFF context', () => {
    // Arrange: set a productLookupKey in the store and provide a fake pricing payload
    checkoutFormStore.setState((s) => ({ ...s, productLookupKey: 'essentials_test_key' }));

    // Mock useBFFContext to invoke the provided selector with a fake pricing payload
    mockedUseBFFContext.mockImplementation((_userId: any, options: any) => {
      const fakePricing = {
        prices: [
          { lookupKey: 'essentials_test_key', unitAmount: 7500 },
          { lookupKey: 'teams_subscription_license_yearly', unitAmount: 20000 },
        ],
        defaultByLookupKey: 'teams_subscription_license_yearly',
      } as any;
      const selected = options && typeof options.select === 'function'
        ? options.select({ pricing: fakePricing })
        : null;
      return { data: selected };
    });

    renderWithAppContext(<HookConsumer />);

    expect(screen.getByTestId('per-user')).toHaveTextContent('75');
    expect(screen.getByTestId('total')).toHaveTextContent('300');
  });

  it('derives prices from useBFFContext unitPrice and store quantity', () => {
    // Simulate BFF returning a unitPrice (dollars) after extractor select
    mockedUseBFFContext.mockReturnValue({ data: 50 });

    renderWithAppContext(<HookConsumer />);

    expect(screen.getByTestId('per-user')).toHaveTextContent('50');
    expect(screen.getByTestId('total')).toHaveTextContent('200');

    // Ensure our mock was invoked, with userId from AppContext first arg
    expect(mockedUseBFFContext).toHaveBeenCalledWith(12345, expect.any(Object));
  });

  it('returns null pricing when useBFFContext has no price (null)', () => {
    mockedUseBFFContext.mockReturnValue({ data: null });

    renderWithAppContext(<HookConsumer />);

    expect(screen.getByTestId('per-user')).toHaveTextContent('null');
    expect(screen.getByTestId('total')).toHaveTextContent('null');
  });

  it('checkoutFormStore.setProductLookupKey updates the productLookupKey in the store', () => {
    checkoutFormStore.getState().setProductLookupKey('');

    checkoutFormStore.getState().setProductLookupKey('essentials-lookup');

    expect(checkoutFormStore.getState().productLookupKey).toBe('essentials-lookup');
  });
});

describe('useCheckoutEventProductProperties (hook)', () => {
  const pricing = {
    defaultByLookupKey: 'teams_yearly',
    prices: [
      {
        lookupKey: 'teams_yearly', product: 'prod_teams', unitAmount: 39600, sspProductSlug: 'teams-yearly',
      },
      {
        lookupKey: 'ai_academy_yearly', product: 'prod_ai', unitAmount: 14900, sspProductSlug: 'ai-academy-yearly',
      },
    ],
  };
  const appContextValue = { authenticatedUser: { userId: 12345 }, config: {} } as any;
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AppContext.Provider value={appContextValue}>{children}</AppContext.Provider>
  );
  const setStore = (sspProductSlug: string, selectedProduct?: object) => {
    checkoutFormStore.setState((s) => ({
      ...s,
      sspProductSlug,
      formData: { ...s.formData, [DataStoreKey.AcademySelection]: { selectedProduct } },
    }));
  };
  // Run the hook's selector against fake BFF data, as useBFFContext would.
  const mockBFFData = (checkoutIntent: object | null = null) => {
    mockedUseBFFContext.mockImplementation((_userId, options) => ({
      data: options.select({ pricing, checkoutIntent }),
    }));
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockBFFData();
  });

  it('builds Teams properties from the price matching the Teams slug', () => {
    setStore('teams-yearly');
    const { result } = renderHook(() => useCheckoutEventProductProperties(), { wrapper });

    expect(mockedUseBFFContext).toHaveBeenCalledWith(
      12345,
      expect.objectContaining({ placeholderData: keepPreviousData }),
    );
    expect(result.current).toEqual({
      product_id: 'prod_teams',
      category: 'subscription',
      name: 'teams',
      brand: 'enterprise',
      price: 396,
      slug: 'teams-yearly',
      payment_schedule: 'yearly',
    });
  });

  it('builds Essentials properties from the price matching the academy slug, with the academy variant', () => {
    setStore('ai-academy-yearly', { name: 'AI Academy' });
    const { result } = renderHook(() => useCheckoutEventProductProperties(), { wrapper });

    expect(result.current).toEqual({
      product_id: 'prod_ai',
      category: 'subscription',
      name: 'essentials',
      brand: 'enterprise',
      variant: 'AI Academy',
      price: 149,
      slug: 'ai-academy-yearly',
      payment_schedule: 'yearly',
    });
  });

  it('prefers the checkout intent SSP product over the slug in the form store', () => {
    mockBFFData({ sspProduct: 'ai-academy-yearly' });
    setStore('teams-yearly');
    const { result } = renderHook(() => useCheckoutEventProductProperties(), { wrapper });

    expect(result.current).toEqual(expect.objectContaining({ product_id: 'prod_ai', slug: 'ai-academy-yearly' }));
  });

  it('returns only the constant properties when pricing is unavailable', () => {
    mockedUseBFFContext.mockReturnValue({ data: null });
    setStore('teams-yearly');
    const { result } = renderHook(() => useCheckoutEventProductProperties(), { wrapper });

    expect(result.current).toEqual({
      category: 'subscription', name: 'teams', brand: 'enterprise', payment_schedule: 'yearly',
    });
  });
});
