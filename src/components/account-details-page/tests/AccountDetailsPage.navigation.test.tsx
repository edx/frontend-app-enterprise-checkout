import { IntlProvider } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Stepper } from '@openedx/paragon';
import { useQueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { useCheckoutIntent, useFormValidationConstraints } from '@/components/app/data';
import { useCreateCheckoutSessionMutation } from '@/components/app/data/hooks';
import { isEssentialsFlow } from '@/components/app/routes/loaders/utils';
import { useStepperContent } from '@/components/Stepper/Steps/hooks';
import { CheckoutStepKey, DataStoreKey, EssentialsPageRoute } from '@/constants/checkout';
import { useCheckoutFormStore, useCurrentPageDetails } from '@/hooks/index';

import AccountDetailsPage from '../AccountDetailsPage';

jest.mock('@hookform/resolvers/zod', () => ({
  zodResolver: jest.fn(),
}));

jest.mock('@edx/frontend-platform/react', () => {
  const { createContext } = jest.requireActual('react');

  return {
    AppContext: createContext({ authenticatedUser: { userId: 12345 } }),
  };
});

jest.mock('@tanstack/react-query', () => ({
  useQueryClient: jest.fn(),
}));

jest.mock('react-hook-form', () => ({
  useForm: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}));

jest.mock('@/components/app/data', () => ({
  useCheckoutIntent: jest.fn(),
  useFormValidationConstraints: jest.fn(),
}));

jest.mock('@/components/app/data/hooks', () => ({
  useCreateCheckoutSessionMutation: jest.fn(),
}));

jest.mock('@/components/app/routes/loaders/utils', () => ({
  ...jest.requireActual('@/components/app/routes/loaders/utils'),
  isEssentialsFlow: jest.fn(),
}));

jest.mock('@/components/Stepper/Steps/hooks', () => ({
  useStepperContent: jest.fn(),
}));

jest.mock('@/hooks/index', () => ({
  useCheckoutFormStore: jest.fn(),
  useCurrentPageDetails: jest.fn(),
}));

jest.mock('@/utils/common', () => ({
  sendEnterpriseCheckoutTrackingEvent: jest.fn(),
}));

jest.mock('../AccountDetailsSubmitButton', () => function MockAccountDetailsSubmitButton() {
  return <button type="submit">Continue</button>;
});

type MutationState = {
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
  reset: jest.Mock;
  mutate: jest.Mock;
};

const mockNavigate = jest.fn();
const mockSetFormData = jest.fn();
const mockReset = jest.fn();
const mockSetError = jest.fn();
const mockInvalidateQueries = jest.fn();
const mockSetQueryData = jest.fn();
const mockMutate = jest.fn();
const mockMutationReset = jest.fn();
const mockFormData = {
  companyName: 'edX',
  enterpriseSlug: 'edx-team',
};
const mockPlanData = {
  quantity: 10,
  adminEmail: 'admin@example.com',
  stripePriceId: 'price_123',
};
let mutationConfig: any;
let mutationState: MutationState;

const setupMutation = (overrides: Partial<MutationState> = {}) => {
  mutationState = {
    isPending: false,
    isSuccess: false,
    isError: false,
    reset: mockMutationReset,
    mutate: mockMutate,
    ...overrides,
  };
  (useCreateCheckoutSessionMutation as jest.Mock).mockImplementation((config) => {
    mutationConfig = config;
    return mutationState;
  });
};

const renderComponent = () => render(
  <IntlProvider locale="en">
    <AppContext.Provider value={{ authenticatedUser: { userId: 12345 } } as any}>
      <Stepper activeKey={CheckoutStepKey.AccountDetails}>
        <AccountDetailsPage />
      </Stepper>
    </AppContext.Provider>
  </IntlProvider>,
);

describe('AccountDetailsPage Essentials navigation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mutationConfig = undefined;
    (zodResolver as jest.Mock).mockReturnValue(jest.fn());
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    (useCheckoutIntent as jest.Mock).mockReturnValue({ data: { id: 99 } });
    (useFormValidationConstraints as jest.Mock).mockReturnValue({ data: {} });
    (useQueryClient as jest.Mock).mockReturnValue({
      invalidateQueries: mockInvalidateQueries,
      setQueryData: mockSetQueryData,
    });
    (useStepperContent as jest.Mock).mockReturnValue(() => <div>Stepper content</div>);
    (useCurrentPageDetails as jest.Mock).mockReturnValue({
      buttonMessage: 'Continue',
      formSchema: jest.fn(() => ({})),
    });
    (isEssentialsFlow as jest.Mock).mockReturnValue(true);
    (useCheckoutFormStore as unknown as jest.Mock).mockImplementation((selector) => selector({
      formData: {
        [DataStoreKey.AccountDetails]: mockFormData,
        [DataStoreKey.PlanDetails]: mockPlanData,
      },
      setFormData: mockSetFormData,
    }));
    (useForm as jest.Mock).mockReturnValue({
      handleSubmit: (callback) => (event?: React.FormEvent) => {
        event?.preventDefault?.();
        return callback(mockFormData);
      },
      formState: { isDirty: false, isValid: true },
      setError: mockSetError,
      reset: mockReset,
    });
    setupMutation();
  });

  it('navigates to Essentials billing details on successful checkout session creation', async () => {
    renderComponent();

    mutationConfig.onSuccess({ checkoutSessionClientSecret: 'secret_123' });

    expect(mockNavigate).toHaveBeenCalledWith(EssentialsPageRoute.BillingDetails);
  });

  it('calls mutate with account and plan data when submit is clicked before mutation succeeds', async () => {
    const user = userEvent.setup();

    renderComponent();
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    expect(mockMutate).toHaveBeenCalledWith({
      stripePriceId: 'price_123',
      adminEmail: 'admin@example.com',
      enterpriseSlug: 'edx-team',
      companyName: 'edX',
      quantity: 10,
    });
  });

  it('navigates to Essentials billing details when submit is clicked after mutation already succeeded', async () => {
    const user = userEvent.setup();
    setupMutation({ isSuccess: true });

    renderComponent();
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    expect(mockNavigate).toHaveBeenCalledWith(EssentialsPageRoute.BillingDetails);
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('maps field errors to form errors when mutation returns page-specific errors', () => {
    renderComponent();

    mutationConfig.onError({
      companyName: { errorCode: 'existing_enterprise_customer' },
      enterpriseSlug: { errorCode: 'invalid_format' },
    });

    expect(mockSetError).toHaveBeenCalledWith('companyName', {
      type: 'manual',
      message: 'existing_enterprise_customer',
    });
    expect(mockSetError).toHaveBeenCalledWith('enterpriseSlug', {
      type: 'manual',
      message: 'invalid_format',
    });
  });

  it('sets a root server error when mutation returns no field errors', () => {
    renderComponent();

    mutationConfig.onError(undefined);

    expect(mockSetError).toHaveBeenCalledWith('root.serverError', {
      type: 'manual',
      message: 'Server Error',
    });
  });

  it('resets mutation state when the form becomes dirty after a successful mutation', () => {
    setupMutation({ isSuccess: true });
    (useForm as jest.Mock).mockReturnValue({
      handleSubmit: (callback) => (event?: React.FormEvent) => {
        event?.preventDefault?.();
        return callback(mockFormData);
      },
      formState: { isDirty: true, isValid: true },
      setError: mockSetError,
      reset: mockReset,
    });

    renderComponent();

    expect(mockMutationReset).toHaveBeenCalled();
  });

  it('navigates back to Essentials plan details when Back is clicked', async () => {
    const user = userEvent.setup();

    renderComponent();
    await user.click(screen.getByRole('button', { name: 'Back' }));

    expect(mockNavigate).toHaveBeenCalledWith(EssentialsPageRoute.PlanDetails);
  });
});
