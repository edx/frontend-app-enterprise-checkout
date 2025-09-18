import { IntlProvider } from '@edx/frontend-platform/i18n';
import { QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { useForm } from 'react-hook-form';

import { useCheckoutIntent } from '@/components/app/data';
import { queryClient } from '@/utils/tests';

import TermsAndConditions from '../TermsAndConditions/TermsAndConditions';

jest.mock('@/utils/common', () => ({
  ...jest.requireActual('@/utils/common'),
  sendEnterpriseCheckoutTrackingEvent: jest.fn(),
}));

jest.mock('@/components/app/data', () => ({
  ...jest.requireActual('@/components/app/data'),
  useCheckoutIntent: jest.fn(),
}));

const TestWrapper: React.FC = () => {
  const form = useForm<BillingDetailsData>({
    mode: 'onTouched',
    defaultValues: {
      confirmTnC: false,
      confirmSubscription: false,
    } as Partial<BillingDetailsData>,
  });
  return <TermsAndConditions form={form} />;
};

const { sendEnterpriseCheckoutTrackingEvent } = jest.requireMock('@/utils/common');

describe('TermsAndConditions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useCheckoutIntent as jest.Mock).mockReturnValue({
      data: {
        id: 1,
      },
    });
  });

  const renderComponent = () => render(
    <QueryClientProvider client={queryClient()}>
      <IntlProvider locale="en">
        <TestWrapper />
      </IntlProvider>,
    </QueryClientProvider>,
  );

  it('renders the title correctly', () => {
    renderComponent();
    validateText('edX Enterprise Terms');
  });

  it('renders the description correctly', () => {
    renderComponent();
    validateText((content) => content.includes('By subscribing,'));
    validateText((content) => content.includes('linked below.'));
  });

  it('renders the checkbox correctly', () => {
    renderComponent();
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    expect(checkboxes.length).toEqual(2);
    validateText('I have read and accepted the edX Enterprise Product Descriptions and Terms and edX Enterprise Sales Terms and Conditions.');
    validateText('I confirm I am subscribing on behalf of my employer, school or other professional organization for use by my institution\'s employees, students and/or other sponsored learners.');
    const [checkbox1, checkbox2] = checkboxes;
    expect(checkbox1).not.toBeChecked();
    expect(checkbox2).not.toBeChecked();
  });

  it('checks the checkbox when clicked', async () => {
    const user = userEvent.setup();
    renderComponent();
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');

    expect(checkboxes.length).toEqual(2);
    const [checkbox1, checkbox2] = checkboxes;
    expect(checkbox1).not.toBeChecked();
    expect(checkbox2).not.toBeChecked();

    await user.click(checkbox1);
    expect(checkbox1).toBeChecked();
    expect(sendEnterpriseCheckoutTrackingEvent).toHaveBeenCalledTimes(1);

    await user.click(checkbox2);
    expect(checkbox2).toBeChecked();
    expect(sendEnterpriseCheckoutTrackingEvent).toHaveBeenCalledTimes(2);
  });
});
