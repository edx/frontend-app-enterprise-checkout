import '@testing-library/jest-dom';
import { act, screen } from '@testing-library/react';

import { useCheckoutSessionClientSecret, useFormValidationConstraints } from '@/components/app/data';
import BillingDetails from '@/components/Stepper/Steps/BillingDetails';
import { useStepperContent } from '@/components/Stepper/Steps/hooks';
import { CheckoutPageRoute, CheckoutStepKey } from '@/constants/checkout';
import { renderWithRouterAndStepperProvider } from '@/utils/tests';

import type { UseFormReturn } from 'react-hook-form';

jest.mock('@/components/app/data', () => ({
  ...jest.requireActual('@/components/app/data'),
  useCheckoutSessionClientSecret: jest.fn(),
  useFormValidationConstraints: jest.fn(),
}));

jest.mock('@/components/Stepper/Steps/hooks', () => ({
  useStepperContent: jest.fn(),
}));

const mockedUseCheckoutSessionClientSecret = useCheckoutSessionClientSecret as jest.Mock;
const mockedUseFormValidationConstraints = useFormValidationConstraints as jest.Mock;
const mockedUseStepperContent = useStepperContent as jest.Mock;

describe('BillingDetails', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseFormValidationConstraints.mockReturnValue({ data: null });
  });

  it('passes a configured billing form to stepper content when the checkout session client secret is missing', async () => {
    let capturedForm: UseFormReturn<BillingDetailsData> | undefined;

    mockedUseCheckoutSessionClientSecret.mockReturnValue(undefined);
    mockedUseStepperContent.mockReturnValue(({ form }: { form?: UseFormReturn<BillingDetailsData> }) => {
      capturedForm = form;

      return <div>{form ? 'form provided' : 'form missing'}</div>;
    });

    renderWithRouterAndStepperProvider(
      <BillingDetails />,
      CheckoutStepKey.BillingDetails,
      { initialEntries: [CheckoutPageRoute.BillingDetails] },
    );

    expect(screen.getByText('form provided')).toBeInTheDocument();
    expect(capturedForm).toBeDefined();
    expect(capturedForm).toEqual(expect.objectContaining({
      handleSubmit: expect.any(Function),
      getValues: expect.any(Function),
    }));
    expect(capturedForm!.getValues()).toEqual({});

    await act(async () => {
      await expect(capturedForm!.trigger()).resolves.toBe(false);
    });
  });
});
