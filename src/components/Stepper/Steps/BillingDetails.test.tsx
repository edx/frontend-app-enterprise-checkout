import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';

import { useCheckoutSessionClientSecret, useFormValidationConstraints } from '@/components/app/data';
import BillingDetails from '@/components/Stepper/Steps/BillingDetails';
import { useStepperContent } from '@/components/Stepper/Steps/hooks';
import { CheckoutPageRoute, CheckoutStepKey } from '@/constants/checkout';
import { renderWithRouterAndStepperProvider } from '@/utils/tests';

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

  it('passes a form to stepper content when the checkout session client secret is missing', () => {
    mockedUseCheckoutSessionClientSecret.mockReturnValue(undefined);
    mockedUseStepperContent.mockReturnValue(({ form }: { form?: unknown }) => (
      <div>{form ? 'form provided' : 'form missing'}</div>
    ));

    renderWithRouterAndStepperProvider(
      <BillingDetails />,
      CheckoutStepKey.BillingDetails,
      { initialEntries: [CheckoutPageRoute.BillingDetails] },
    );

    expect(screen.getByText('form provided')).toBeInTheDocument();
  });
});
