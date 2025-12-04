import { IntlProvider } from '@edx/frontend-platform/i18n';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';

import { usePurchaseSummaryPricing } from '@/components/app/data';
import { SUBSCRIPTION_TRIAL_LENGTH_DAYS } from '@/components/app/data/constants';
import { DataStoreKey } from '@/constants/checkout';
import { checkoutFormStore } from '@/hooks/useCheckoutFormStore';

import PurchaseSummary from '../PurchaseSummary';

jest.mock('@/components/app/data', () => ({
  __esModule: true,
  usePurchaseSummaryPricing: jest.fn(),
  useCreateBillingPortalSession: jest.fn(() => ({ data: { url: null } })),
  useCheckoutIntent: jest.fn(() => ({ data: { id: 123 } })),
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
        <MemoryRouter>
          <PurchaseSummary />
        </MemoryRouter>
      </IntlProvider>,
    );

    // Header
    validateText('Purchase summary');
    validateText('For Acme');

    // Price per user row
    validateText('Team Subscription, price per user, paid yearly');
    validateText('$50 USD');

    // Licenses row
    validateText('Number of licenses');
    validateText('x3');

    // Total after trial row
    validateText(`Total after ${SUBSCRIPTION_TRIAL_LENGTH_DAYS}-day free trial`);
    validateText('$150 USD');
    expect(screen.getAllByText(/\/yr/).length).toBeGreaterThan(0);

    // Auto renew notice
    validateText(/Auto-renews annually/i);

    // Due today row
    validateText('Due today');
    validateText('$0');
  });
});
