import { IntlProvider } from '@edx/frontend-platform/i18n';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import React from 'react';

import { usePurchaseSummaryPricing } from '@/components/app/data';
import { DataStoreKey } from '@/constants/checkout';
import { checkoutFormStore } from '@/hooks/useCheckoutFormStore';

import PurchaseSummary from '../PurchaseSummary';

jest.mock('@/components/app/data', () => ({
  __esModule: true,
  usePurchaseSummaryPricing: jest.fn(),
}));

describe('PurchaseSummary', () => {
  beforeEach(() => {
    // Seed the form store
    checkoutFormStore.setState((s) => ({
      ...s,
      formData: {
        ...s.formData,
        [DataStoreKey.PlanDetails]: { quantity: 3 },
        [DataStoreKey.AccountDetails]: { companyName: 'Acme' },
      },
    }));

    (usePurchaseSummaryPricing as jest.Mock).mockReturnValue({
      yearlySubscriptionCostForQuantity: 150,
      yearlyCostPerSubscriptionPerUser: 50,
    });
  });

  it('renders header and rows with computed values', () => {
    render(
      <IntlProvider locale="en">
        <PurchaseSummary />
      </IntlProvider>,
    );

    // Header
    expect(screen.getByText('Purchase summary')).toBeInTheDocument();
    expect(screen.getByText('For Acme')).toBeInTheDocument();

    // Price per user row
    expect(screen.getByText('Team Subscription, price per user, paid yearly')).toBeInTheDocument();
    expect(screen.getByText('$50')).toBeInTheDocument();

    // Licenses row
    expect(screen.getByText('Number of licenses')).toBeInTheDocument();
    expect(screen.getByText('x3')).toBeInTheDocument();

    // Total after trial row
    expect(screen.getByText('Total after trial')).toBeInTheDocument();
    expect(screen.getByText('$150')).toBeInTheDocument();
    expect(screen.getByText('USD', { exact: false })).toBeInTheDocument();
    expect(screen.getAllByText(/\/yr/).length).toBeGreaterThan(0);

    // Auto renew notice
    expect(screen.getByText(/Auto-renews annually/i)).toBeInTheDocument();

    // Due today row
    expect(screen.getByText('Due today')).toBeInTheDocument();
  });
});
