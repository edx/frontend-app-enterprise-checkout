import { AppContext } from '@edx/frontend-platform/react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import useBFFContext from '@/components/app/data/hooks/useBFFContext';
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
    mockedUseBFFContext.mockImplementation((userId: any, options: any) => {
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
});
