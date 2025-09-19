import { IntlProvider } from '@edx/frontend-platform/i18n';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
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
    validateText('Purchase summary');
    validateText('For Acme');

    // Price per user row
    validateText('Team Subscription, price per user, paid yearly');
    validateText('$50');

    // Licenses row
    validateText('Number of licenses');
    validateText('x3');

    // Total after trial row
    validateText('Total after trial');
    validateText('$150');
    validateText('USD', { exact: false });
    expect(screen.getAllByText(/\/yr/).length).toBeGreaterThan(0);

    // Auto renew notice
    validateText(/Auto-renews annually/i);

    // Due today row
    validateText('Due today');
  });
});
