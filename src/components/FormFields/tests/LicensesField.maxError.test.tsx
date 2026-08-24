import { getConfig } from '@edx/frontend-platform/config';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';

import { useFormValidationConstraints } from '@/components/app/data';
import { validateFieldDetailed } from '@/components/app/data/services/validation';
import { getQuantityMaxValidationMessage, PlanDetailsSchema } from '@/constants/checkout';

import LicensesField from '../LicensesField';

jest.mock('@/hooks/useFieldTracking', () => ({
  trackFieldBlur: jest.fn(),
}));

jest.mock('@/hooks/useCurrentStep', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    currentStep: 'PlanDetails',
    currentStepKey: 'plan-details',
    currentSubstepKey: 'login',
  })),
}));

jest.mock('@/components/app/data/hooks/useBFFContext', () => ({
  __esModule: true,
  default: jest.fn(() => ({ data: { checkoutIntent: { id: 123 } } })),
}));

jest.mock('@/components/app/data', () => ({
  useFormValidationConstraints: jest.fn(),
}));

jest.mock('@/components/app/data/services/validation', () => ({
  validateFieldDetailed: jest.fn(),
}));

jest.mock('@edx/frontend-platform/config', () => ({
  getConfig: jest.fn(() => ({})),
}));

const mockAuthenticatedUser = {
  userId: 1,
  username: 'test-user',
  roles: [],
  administrator: false,
};

interface RenderOptions {
  quantity: number;
  constraintsMax: number;
  config: Record<string, string | null>;
}

const renderWithForm = ({ quantity, constraintsMax, config }: RenderOptions) => {
  (useFormValidationConstraints as jest.Mock).mockReturnValue({
    data: { quantity: { max: constraintsMax } },
  });
  (getConfig as jest.Mock).mockReturnValue(config);
  (validateFieldDetailed as jest.Mock).mockResolvedValue({ isValid: true, validationDecisions: null });

  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  const Wrapper = () => {
    const schema = useMemo(
      () => PlanDetailsSchema({ quantity: { max: constraintsMax } }, 'price_123'),
      [],
    );
    const form = useForm({
      resolver: zodResolver(schema),
      defaultValues: {
        quantity,
        fullName: 'Jane Doe',
        adminEmail: 'jane@example.com',
        country: 'US',
        stripePriceId: 'price_123',
      },
    });
    // Access formState so this component (and its LicensesField child) re-renders on validation updates.
    const { errors } = form.formState;

    return (
      <IntlProvider locale="en">
        <AppContext.Provider value={{ authenticatedUser: mockAuthenticatedUser }}>
          <QueryClientProvider client={queryClient}>
            <LicensesField form={form} />
            <span data-testid="quantity-error-type" style={{ display: 'none' }}>
              {errors.quantity?.type ?? ''}
            </span>
            <button type="button" onClick={() => { form.trigger('quantity').catch(() => {}); }}>
              trigger-validate
            </button>
          </QueryClientProvider>
        </AppContext.Provider>
      </IntlProvider>
    );
  };

  return render(<Wrapper />);
};

describe('LicensesField max-quantity contact link', () => {
  afterEach(() => {
    sessionStorage.removeItem('isEssentials');
    jest.clearAllMocks();
  });

  it('renders a Teams-flow contact-us link pointing at TEAMS_PRODUCT_URL', async () => {
    sessionStorage.removeItem('isEssentials');
    renderWithForm({
      quantity: 31,
      constraintsMax: 30,
      config: {
        TEAMS_PRODUCT_URL: 'https://example.com/teams',
        ESSENTIALS_PRODUCT_URL: 'https://example.com/essentials',
      },
    });

    await userEvent.click(screen.getByText('trigger-validate'));

    await waitFor(() => {
      expect(screen.getByText(/Teams plan/)).toBeInTheDocument();
    });
    expect(screen.getByText(/up to 30 licenses/)).toBeInTheDocument();

    const link = screen.getByRole('link', { name: /contact us/i });
    expect(link).toHaveAttribute('href', 'https://example.com/teams');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders an Essentials-flow contact-us link pointing at ESSENTIALS_PRODUCT_URL', async () => {
    sessionStorage.setItem('isEssentials', 'true');
    renderWithForm({
      quantity: 31,
      constraintsMax: 30,
      config: {
        TEAMS_PRODUCT_URL: 'https://example.com/teams',
        ESSENTIALS_PRODUCT_URL: 'https://example.com/essentials',
      },
    });

    await userEvent.click(screen.getByText('trigger-validate'));

    await waitFor(() => {
      expect(screen.getByText(/Essentials plan/)).toBeInTheDocument();
    });

    const link = screen.getByRole('link', { name: /contact us/i });
    expect(link).toHaveAttribute('href', 'https://example.com/essentials');
  });

  it('does not render a contact-us link for a non-maximum quantity error', async () => {
    renderWithForm({
      quantity: 0,
      constraintsMax: 30,
      config: {
        TEAMS_PRODUCT_URL: 'https://example.com/teams',
        ESSENTIALS_PRODUCT_URL: 'https://example.com/essentials',
      },
    });

    await userEvent.click(screen.getByText('trigger-validate'));

    await waitFor(() => {
      expect(screen.getByText('Number of licenses is required')).toBeInTheDocument();
    });
    expect(screen.queryByRole('link', { name: 'contact us' })).not.toBeInTheDocument();
  });

  it('falls back to the complete plain-text message when the product URL is missing', async () => {
    sessionStorage.removeItem('isEssentials');
    renderWithForm({
      quantity: 31,
      constraintsMax: 30,
      config: {
        TEAMS_PRODUCT_URL: null,
        ESSENTIALS_PRODUCT_URL: 'https://example.com/essentials',
      },
    });

    await userEvent.click(screen.getByText('trigger-validate'));

    const expectedMessage = getQuantityMaxValidationMessage(30, 'teams').plainText;
    await waitFor(() => {
      expect(screen.getByText(expectedMessage)).toBeInTheDocument();
    });
    expect(screen.queryByRole('link', { name: 'contact us' })).not.toBeInTheDocument();
  });
});
