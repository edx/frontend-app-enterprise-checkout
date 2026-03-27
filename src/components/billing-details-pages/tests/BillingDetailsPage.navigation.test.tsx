import { IntlProvider } from '@edx/frontend-platform/i18n';
import { zodResolver } from '@hookform/resolvers/zod';
import { Stepper } from '@openedx/paragon';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { useCheckoutIntent, useFormValidationConstraints } from '@/components/app/data';
import { isEssentialsFlow } from '@/components/app/routes/loaders/utils';
import { useStepperContent } from '@/components/Stepper/Steps/hooks';
import { CheckoutStepKey, DataStoreKey, EssentialsPageRoute } from '@/constants/checkout';
import { useCheckoutFormStore, useCurrentPageDetails } from '@/hooks/index';

import BillingDetailsPage from '../BillingDetailsPage';

jest.mock('@hookform/resolvers/zod', () => ({
  zodResolver: jest.fn(),
}));

jest.mock('react-hook-form', () => ({
  useForm: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}));

jest.mock('@/components/app/routes/loaders/utils', () => ({
  ...jest.requireActual('@/components/app/routes/loaders/utils'),
  isEssentialsFlow: jest.fn(),
}));

jest.mock('@/components/app/data', () => ({
  useCheckoutIntent: jest.fn(),
  useFormValidationConstraints: jest.fn(),
}));

jest.mock('@/components/Stepper/Steps/hooks', () => ({
  useStepperContent: jest.fn(),
}));

jest.mock('@/components/StatefulButton', () => ({
  StatefulSubscribeButton: () => <div>Subscribe button</div>,
}));

jest.mock('@/hooks/index', () => ({
  useCheckoutFormStore: jest.fn(),
  useCurrentPageDetails: jest.fn(),
}));

jest.mock('@/utils/common', () => ({
  sendEnterpriseCheckoutTrackingEvent: jest.fn(),
}));

const mockNavigate = jest.fn();
const mockSetFormData = jest.fn();

describe('BillingDetailsPage Essentials navigation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (zodResolver as jest.Mock).mockReturnValue(jest.fn());
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    (useCheckoutIntent as jest.Mock).mockReturnValue({ data: { id: 77 } });
    (useFormValidationConstraints as jest.Mock).mockReturnValue({ data: {} });
    (isEssentialsFlow as jest.Mock).mockReturnValue(true);
    (useStepperContent as jest.Mock).mockReturnValue(() => <div>Stepper content</div>);
    (useCurrentPageDetails as jest.Mock).mockReturnValue({
      buttonMessage: 'Continue',
      formSchema: jest.fn(() => ({})),
    });
    (useCheckoutFormStore as unknown as jest.Mock).mockImplementation((selector) => selector({
      formData: {
        [DataStoreKey.BillingDetails]: {
          confirmTnC: true,
          confirmSubscription: true,
        },
      },
      setFormData: mockSetFormData,
    }));
    (useForm as jest.Mock).mockReturnValue({
      handleSubmit: (callback) => (event?: React.FormEvent) => {
        event?.preventDefault?.();
        return callback({ confirmTnC: true, confirmSubscription: true });
      },
    });
  });

  it('navigates back to the Essentials account details route', async () => {
    const user = userEvent.setup();

    render(
      <IntlProvider locale="en">
        <Stepper activeKey={CheckoutStepKey.BillingDetails}>
          <BillingDetailsPage />
        </Stepper>
      </IntlProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Back' }));

    expect(mockNavigate).toHaveBeenCalledWith(EssentialsPageRoute.AccountDetails);
  });
});
