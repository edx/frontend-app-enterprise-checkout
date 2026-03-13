import { IntlProvider } from '@edx/frontend-platform/i18n';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import 'whatwg-fetch';

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

beforeAll(() => {
  jest.spyOn(global, 'fetch').mockImplementation((url: string) => {
    if (typeof url === 'string') {
      if (url.includes('/api/v1/testimonials/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ results: [] }),
        } as Response);
      }
      if (url.includes('/api/v1/orders/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ id: 123, status: 'pending' }),
        } as Response);
      }
    }

    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({}),
    } as Response);
  }) as jest.Mock;
});

afterAll(() => {
  jest.restoreAllMocks();
});

describe('PurchaseSummary', () => {
  beforeEach(() => {
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

    (global.fetch as jest.Mock).mockClear();
  });

  it('renders header and rows with computed values', () => {
    render(
      <IntlProvider locale="en">
        <MemoryRouter>
          <PurchaseSummary />
        </MemoryRouter>
      </IntlProvider>,
    );

    expect(screen.getByText('Purchase summary')).toBeInTheDocument();
    expect(screen.getByText('For Acme')).toBeInTheDocument();
    expect(screen.getByText('Team Subscription, price per user, paid yearly')).toBeInTheDocument();
    expect(screen.getByText('$50 USD')).toBeInTheDocument();
    expect(screen.getByText('Number of licenses')).toBeInTheDocument();
    expect(screen.getByText('x3')).toBeInTheDocument();
    expect(
      screen.getByText(`Total after ${SUBSCRIPTION_TRIAL_LENGTH_DAYS}-day free trial`),
    ).toBeInTheDocument();
    expect(screen.getByText('$150 USD')).toBeInTheDocument();
    expect(screen.getByText(/Auto-renews annually/i)).toBeInTheDocument();
    expect(screen.getByText('Due today')).toBeInTheDocument();
    expect(screen.getByText('$0')).toBeInTheDocument();
  });

  it('calls the testimonials API on mount', async () => {
    render(
      <IntlProvider locale="en">
        <MemoryRouter>
          <PurchaseSummary />
        </MemoryRouter>
      </IntlProvider>,
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/testimonials/'),
        expect.any(Object),
      );
    });
  });

  it('handles fetch failure gracefully', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() => Promise.reject(new Error('API failure')));

    render(
      <IntlProvider locale="en">
        <MemoryRouter>
          <PurchaseSummary />
        </MemoryRouter>
      </IntlProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Purchase summary')).toBeInTheDocument();
    });
  });
});
