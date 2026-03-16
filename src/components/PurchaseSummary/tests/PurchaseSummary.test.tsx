import { IntlProvider } from '@edx/frontend-platform/i18n';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import 'whatwg-fetch';

import { usePurchaseSummaryPricing } from '@/components/app/data';
import { SUBSCRIPTION_TRIAL_LENGTH_DAYS } from '@/components/app/data/constants';
import useTestimonials from '@/components/app/data/hooks/useTestimonials';
import { DataStoreKey } from '@/constants/checkout';
import { checkoutFormStore } from '@/hooks/useCheckoutFormStore';

import PurchaseSummary from '../PurchaseSummary';

// Mock your custom hooks
jest.mock('@/components/app/data', () => ({
  __esModule: true,
  usePurchaseSummaryPricing: jest.fn(),
  useCreateBillingPortalSession: jest.fn(() => ({ data: { url: null } })),
  useCheckoutIntent: jest.fn(() => ({ data: { id: 123 } })),
}));

// Mock testimonials hook
jest.mock('@/components/app/data/hooks/useTestimonials');

const renderWithProviders = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <IntlProvider locale="en">
        <MemoryRouter>
          <PurchaseSummary />
        </MemoryRouter>
      </IntlProvider>
    </QueryClientProvider>,
  );
};

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

    (useTestimonials as jest.Mock).mockReturnValue({ data: [], isLoading: false });
  });

  it('renders header and rows with computed values', () => {
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

  it('renders correctly when testimonials are empty', async () => {
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('Purchase summary')).toBeInTheDocument();
    });
  });

  it('renders correctly when testimonials exist', async () => {
    (useTestimonials as jest.Mock).mockReturnValue({
      data: [
        {
          uuid: '123',
          quote_text: 'Great product!',
          attribution_name: 'John Doe',
          attribution_title: 'CEO',
        },
      ],
      isLoading: false,
    });

    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('Great product!')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('CEO')).toBeInTheDocument();
    });
  });
});
