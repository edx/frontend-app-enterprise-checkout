import { IntlProvider } from '@edx/frontend-platform/i18n';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import 'whatwg-fetch';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';

import { usePurchaseSummaryPricing } from '@/components/app/data';
import { SUBSCRIPTION_TRIAL_LENGTH_DAYS } from '@/components/app/data/constants';
import useBFFContext from '@/components/app/data/hooks/useBFFContext';
import { DataStoreKey, EssentialsPageRoute } from '@/constants/checkout';
import { checkoutFormStore } from '@/hooks/useCheckoutFormStore';

import PurchaseSummary from '../PurchaseSummary';

jest.mock('@/components/app/data', () => ({
  __esModule: true,
  usePurchaseSummaryPricing: jest.fn(),
  useCreateBillingPortalSession: jest.fn(() => ({ data: { url: null } })),
  useCheckoutIntent: jest.fn(() => ({ data: { id: 123 } })),
}));

jest.mock('@/utils/common', () => ({
  isEssentialsFlow: jest.fn(),
}));

jest.mock('@/components/app/data/hooks/useBFFContext');

const renderWithProviders = (initialRoute = '/') => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <IntlProvider locale="en">
        <MemoryRouter initialEntries={[initialRoute]}>
          <PurchaseSummary />
        </MemoryRouter>
      </IntlProvider>
    </QueryClientProvider>,
  );
};

describe('PurchaseSummary', () => {
  const { isEssentialsFlow } = jest.requireMock('@/utils/common');

  beforeEach(() => {
    jest.clearAllMocks();
    checkoutFormStore.setState((s) => ({
      ...s,
      formData: {
        ...s.formData,
        [DataStoreKey.PlanDetails]: { quantity: 3, academyName: 'AI Academy' },
        [DataStoreKey.AccountDetails]: { companyName: 'Acme' },
        [DataStoreKey.AcademySelection]: { academyName: 'AI Academy' },
      },
    }));

    (usePurchaseSummaryPricing as jest.Mock).mockReturnValue({
      yearlySubscriptionCostForQuantity: 150,
      yearlyCostPerSubscriptionPerUser: 50,
    });
  });

  it('renders teams purchase summary with data-backed rows for non-essentials flow', () => {
    (isEssentialsFlow as jest.Mock).mockReturnValue(false);

    renderWithProviders();

    expect(screen.getByText('Purchase summary')).toBeInTheDocument();
    expect(screen.getByText('For Acme')).toBeInTheDocument();
    expect(screen.getByText('Team Subscription, price per user, paid yearly')).toBeInTheDocument();
    expect(screen.getByText('$50 USD')).toBeInTheDocument();
    expect(screen.getByText('Number of licenses')).toBeInTheDocument();
    expect(screen.getByText('x3')).toBeInTheDocument();
    expect(screen.getByText(`Total after ${SUBSCRIPTION_TRIAL_LENGTH_DAYS}-day free trial`)).toBeInTheDocument();
    expect(screen.getByText('$150 USD')).toBeInTheDocument();
    expect(screen.getByText(/Auto-renews annually/i)).toBeInTheDocument();
    expect(screen.getByText('Due today')).toBeInTheDocument();
    expect(screen.getByText('$0')).toBeInTheDocument();
  });

  it('renders essentials purchase summary with compare plans content for essentials flow', () => {
    (isEssentialsFlow as jest.Mock).mockReturnValue(true);

    checkoutFormStore.setState((state) => ({
      ...state,
      formData: {
        ...state.formData,
        [DataStoreKey.AcademySelection]: {
          selectedProduct: {
            name: 'AI',
            longName: 'AI Academy',
            description: 'Master artificial intelligence fundamentals.',
            price: '149.00',
            lookupKey: 'essentials_artificial_intelligence_subscription_license_yearly',
            slug: 'ai-academy-yearly',
            courseCount: 8,
          },
        },
      },
    }));

    (useBFFContext as jest.Mock).mockReturnValue({ data: null });

    renderWithProviders(EssentialsPageRoute.PlanDetails);

    expect(screen.getByText('Purchase summary')).toBeInTheDocument();
    expect(screen.getByText('AI')).toBeInTheDocument(); // ← component uses product.name, not longName
    expect(screen.getByText('Essentials subscription, price per user, paid yearly.')).toBeInTheDocument();
    expect(screen.getByText('Not sure which plan is right for you?')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Compare plans.' })).toBeInTheDocument();
  });
});
