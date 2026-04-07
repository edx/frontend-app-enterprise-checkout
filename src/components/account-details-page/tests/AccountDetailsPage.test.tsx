import { useQueryClient } from '@tanstack/react-query';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

import { useCheckoutIntent, useFormValidationConstraints } from '@/components/app/data';
import { useCreateCheckoutSessionMutation } from '@/components/app/data/hooks';
import { validateFieldDetailed } from '@/components/app/data/services/validation';
import { CheckoutPageRoute, DataStoreKey, EssentialsPageRoute } from '@/constants/checkout';
import { checkoutFormStore } from '@/hooks/useCheckoutFormStore';
import { sendEnterpriseCheckoutTrackingEvent } from '@/utils/common';
import { renderStepperRoute } from '@/utils/tests';

jest.mock('@/utils/common', () => ({
  ...jest.requireActual('@/utils/common'),
  sendEnterpriseCheckoutTrackingEvent: jest.fn(),
}));

jest.mock('@/components/app/data', () => ({
  ...jest.requireActual('@/components/app/data'),
  useCheckoutIntent: jest.fn(),
  useFormValidationConstraints: jest.fn(),
}));

jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQueryClient: jest.fn(),
}));

jest.mock('@/components/app/data/hooks', () => ({
  ...jest.requireActual('@/components/app/data/hooks'),
  useCreateCheckoutSessionMutation: jest.fn(),
}));

jest.mock('@/components/app/data/services/validation', () => ({
  ...jest.requireActual('@/components/app/data/services/validation'),
  validateFieldDetailed: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('AccountDetailsPage', () => {
  let mutateMock: jest.Mock;
  let resetMock: jest.Mock;
  let setQueryDataMock: jest.Mock;
  let invalidateQueriesMock: jest.Mock;
  let mutationState: { isSuccess: boolean; isPending: boolean; isError: boolean };

  let mutationCallbacks: {
    onSuccess?: (responseData: { checkoutSessionClientSecret: string }) => void;
    onError?: (fieldErrors?: Record<string, any>) => void;
  } = {};

  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.removeItem('isEssentials');

    mutateMock = jest.fn();
    resetMock = jest.fn();
    setQueryDataMock = jest.fn();
    invalidateQueriesMock = jest.fn();
    mutationState = {
      isSuccess: false,
      isPending: false,
      isError: false,
    };

    (useQueryClient as jest.Mock).mockReturnValue({
      setQueryData: setQueryDataMock,
      invalidateQueries: invalidateQueriesMock,
    });

    (useCheckoutIntent as jest.Mock).mockReturnValue({ data: undefined });

    (validateFieldDetailed as jest.Mock).mockResolvedValue({
      isValid: true,
      validationDecisions: {},
    });

    checkoutFormStore.setState((state) => ({
      ...state,
      formData: {
        ...state.formData,
        [DataStoreKey.PlanDetails]: {
          adminEmail: 'admin@example.com',
          quantity: 10,
          stripePriceId: 'price_test_123',
        },
        [DataStoreKey.AccountDetails]: {
          companyName: 'Acme Inc',
          enterpriseSlug: 'acme-inc',
        },
      },
    }));

    (useCreateCheckoutSessionMutation as jest.Mock).mockImplementation((callbacks) => {
      mutationCallbacks = callbacks;
      return {
        mutate: mutateMock,
        isSuccess: mutationState.isSuccess,
        isPending: mutationState.isPending,
        isError: mutationState.isError,
        reset: resetMock,
      };
    });

    (useFormValidationConstraints as jest.Mock).mockReturnValue({
      data: {
        enterpriseSlug: {
          minLength: 3,
          maxLength: 30,
          pattern: /^[a-z0-9-]+$/,
        },
      },
    });
  });

  it('renders the title correctly', () => {
    renderStepperRoute(CheckoutPageRoute.AccountDetails, {
      config: {},
      authenticatedUser: {
        userId: 12345,
      },
    });
    expect(screen.getByTestId('stepper-title')).toHaveTextContent('Account Details');
  });

  it('renders the continue button correctly', () => {
    renderStepperRoute(CheckoutPageRoute.AccountDetails, {
      config: {},
      authenticatedUser: {
        userId: 12345,
      },
    });
    validateText('Continue');
  });

  it('renders the CompanyNameField component', () => {
    renderStepperRoute(CheckoutPageRoute.AccountDetails, {
      config: {},
      authenticatedUser: {
        userId: 12345,
      },
    });
    validateText('What is the name of your company or organization?');
  });

  it('renders the CustomUrlField component', () => {
    renderStepperRoute(CheckoutPageRoute.AccountDetails, {
      config: {},
      authenticatedUser: {
        userId: 12345,
      },
    });
    validateText('Create a custom URL for your team');
  });

  it('navigates back to plan details in essentials flow', async () => {
    const user = userEvent.setup();
    sessionStorage.setItem('isEssentials', 'true');

    renderStepperRoute(EssentialsPageRoute.AccountDetails, {
      config: {},
      authenticatedUser: {
        userId: 12345,
      },
    });

    await user.click(screen.getByRole('button', { name: 'Back' }));

    expect(mockNavigate).toHaveBeenCalledWith(EssentialsPageRoute.PlanDetails);
    sessionStorage.removeItem('isEssentials');
  });

  it('navigates back to plan details in checkout flow', async () => {
    const user = userEvent.setup();
    sessionStorage.removeItem('isEssentials');

    renderStepperRoute(CheckoutPageRoute.AccountDetails, {
      config: {},
      authenticatedUser: {
        userId: 12345,
      },
    });

    await user.click(screen.getByRole('button', { name: 'Back' }));

    expect(mockNavigate).toHaveBeenCalledWith(CheckoutPageRoute.PlanDetails);
  });

  it('persists touched account details values on back and restores validation on revisit', async () => {
    const user = userEvent.setup();

    checkoutFormStore.setState((state) => ({
      ...state,
      formData: {
        ...state.formData,
        [DataStoreKey.AccountDetails]: {},
      },
    }));

    renderStepperRoute(CheckoutPageRoute.AccountDetails, {
      config: {},
      authenticatedUser: {
        userId: 12345,
      },
    });

    const companyNameInput = screen.getByPlaceholderText('Enter your company name');
    const enterpriseSlugInput = screen.getByPlaceholderText('URL name');

    await user.click(companyNameInput);
    await user.click(enterpriseSlugInput);
    await user.type(enterpriseSlugInput, 'invalid slug!');
    await user.click(companyNameInput);

    await user.click(screen.getByRole('button', { name: 'Back' }));

    expect(checkoutFormStore.getState().formData[DataStoreKey.AccountDetails]).toEqual({
      companyName: '',
      enterpriseSlug: 'invalid slug!',
    });

    renderStepperRoute(CheckoutPageRoute.AccountDetails, {
      config: {},
      authenticatedUser: {
        userId: 12345,
      },
    });

    await waitFor(() => {
      expect(screen.getByText('Company name is required')).toBeInTheDocument();
      expect(screen.getByText('Only alphanumeric lowercase characters and hyphens are allowed.')).toBeInTheDocument();
    });
  });

  it('navigates to essentials billing details on successful checkout session creation in essentials flow', () => {
    sessionStorage.setItem('isEssentials', 'true');

    renderStepperRoute(EssentialsPageRoute.AccountDetails, {
      config: {},
      authenticatedUser: {
        userId: 12345,
      },
    });

    mutationCallbacks.onSuccess?.({ checkoutSessionClientSecret: 'client_secret' });

    expect(mockNavigate).toHaveBeenCalledWith(EssentialsPageRoute.BillingDetails);
    sessionStorage.removeItem('isEssentials');
  });

  it('navigates to checkout billing details on successful checkout session creation in checkout flow', () => {
    sessionStorage.removeItem('isEssentials');

    renderStepperRoute(CheckoutPageRoute.AccountDetails, {
      config: {},
      authenticatedUser: {
        userId: 12345,
      },
    });

    mutationCallbacks.onSuccess?.({ checkoutSessionClientSecret: 'client_secret' });

    expect(mockNavigate).toHaveBeenCalledWith(CheckoutPageRoute.BillingDetails);
  });

  it('updates query cache and handles missing checkoutIntent entries on successful checkout session creation', () => {
    const previousWithCheckoutIntent = {
      checkoutIntent: {
        checkoutSessionClientSecret: 'old_secret',
      },
    };
    const previousWithoutCheckoutIntent = {
      some: 'value',
    };

    setQueryDataMock
      .mockImplementationOnce((_, updater) => updater(previousWithCheckoutIntent))
      .mockImplementationOnce((_, updater) => updater(previousWithoutCheckoutIntent));

    renderStepperRoute(CheckoutPageRoute.AccountDetails, {
      config: {},
      authenticatedUser: {
        userId: 12345,
      },
    });

    mutationCallbacks.onSuccess?.({ checkoutSessionClientSecret: 'new_secret' });

    expect(setQueryDataMock).toHaveBeenCalledTimes(2);
    expect(setQueryDataMock.mock.results[0].value).toEqual({
      checkoutIntent: {
        checkoutSessionClientSecret: 'new_secret',
      },
    });
    expect(setQueryDataMock.mock.results[1].value).toBe(previousWithoutCheckoutIntent);
  });

  it('handles mutation onError without field errors', () => {
    renderStepperRoute(CheckoutPageRoute.AccountDetails, {
      config: {},
      authenticatedUser: {
        userId: 12345,
      },
    });

    expect(() => mutationCallbacks.onError?.()).not.toThrow();
  });

  it('handles mutation onError with account-details field errors', () => {
    renderStepperRoute(CheckoutPageRoute.AccountDetails, {
      config: {},
      authenticatedUser: {
        userId: 12345,
      },
    });

    expect(() => mutationCallbacks.onError?.({
      companyName: { errorCode: 'invalid_company' },
      enterpriseSlug: { errorCode: 'invalid_slug' },
    })).not.toThrow();
  });

  it('handles mutation onError with non-page errors', () => {
    renderStepperRoute(CheckoutPageRoute.AccountDetails, {
      config: {},
      authenticatedUser: {
        userId: 12345,
      },
    });

    expect(() => mutationCallbacks.onError?.({
      adminEmail: { errorCode: 'invalid_email' },
    })).not.toThrow();
  });

  it('submits and calls createCheckoutSession mutation when not already successful', async () => {
    const user = userEvent.setup();
    mutationState.isSuccess = false;

    renderStepperRoute(CheckoutPageRoute.AccountDetails, {
      config: {},
      authenticatedUser: {
        userId: 12345,
      },
    });

    await user.click(screen.getByTestId('stepper-submit-button'));

    await waitFor(() => {
      expect(mutateMock).toHaveBeenCalledWith(expect.objectContaining({
        stripePriceId: 'price_test_123',
        adminEmail: 'admin@example.com',
        companyName: 'Acme Inc',
        enterpriseSlug: 'acme-inc',
        quantity: 10,
      }));
    });
  });

  it('submits and navigates directly when mutation is already successful', async () => {
    const user = userEvent.setup();
    mutationState.isSuccess = true;
    sessionStorage.setItem('isEssentials', 'true');

    renderStepperRoute(EssentialsPageRoute.AccountDetails, {
      config: {},
      authenticatedUser: {
        userId: 12345,
      },
    });

    await user.click(screen.getByTestId('stepper-submit-button'));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(EssentialsPageRoute.BillingDetails);
    });
    expect(mutateMock).not.toHaveBeenCalled();
    sessionStorage.removeItem('isEssentials');
  });

  it('submits and navigates directly to checkout billing details when mutation is already successful in checkout flow', async () => {
    const user = userEvent.setup();
    mutationState.isSuccess = true;
    sessionStorage.removeItem('isEssentials');

    renderStepperRoute(CheckoutPageRoute.AccountDetails, {
      config: {},
      authenticatedUser: {
        userId: 12345,
      },
    });

    await user.click(screen.getByTestId('stepper-submit-button'));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(CheckoutPageRoute.BillingDetails);
    });
    expect(mutateMock).not.toHaveBeenCalled();
  });

  it('tracks submit event with checkout intent id when checkout intent exists', async () => {
    const user = userEvent.setup();
    (useCheckoutIntent as jest.Mock).mockReturnValue({
      data: {
        id: 999,
      },
    });

    renderStepperRoute(CheckoutPageRoute.AccountDetails, {
      config: {},
      authenticatedUser: {
        userId: 12345,
      },
    });

    await user.click(screen.getByTestId('stepper-submit-button'));

    await waitFor(() => {
      expect(sendEnterpriseCheckoutTrackingEvent).toHaveBeenCalledWith(expect.objectContaining({
        checkoutIntentId: 999,
      }));
    });
  });

  it('resets mutation when form becomes dirty after successful mutation', async () => {
    mutationState.isSuccess = true;

    renderStepperRoute(CheckoutPageRoute.AccountDetails, {
      config: {},
      authenticatedUser: {
        userId: 12345,
      },
    });

    const companyInput = screen.getByPlaceholderText('Enter your company name');
    fireEvent.change(companyInput, { target: { value: 'Acme Inc Updated' } });

    await waitFor(() => {
      expect(resetMock).toHaveBeenCalled();
    });
  });
});
