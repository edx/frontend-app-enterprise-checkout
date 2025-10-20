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

jest.mock('@edx/frontend-platform/config', () => ({
  getConfig: jest.fn().mockReturnValue({
    ENTERPRISE_PRODUCT_DESCRIPTIONS_AND_TERMS_URL: 'https://example.com/product-terms',
    ENTERPRISE_SALES_TERMS_AND_CONDITIONS_URL: 'https://example.com/sales-terms',
  }),
}));

const TestWrapper: React.FC = () => {
  const form = useForm<BillingDetailsData>({
    mode: 'onTouched',
    defaultValues: {
      confirmTnC: false,
      confirmSubscription: false,
      confirmRecurringSubscription: false,
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
    expect(checkboxes.length).toEqual(3);
    validateText('I have read and accepted the edX Enterprise Product Descriptions and Terms and edX Enterprise Sales Terms and Conditions.');
    validateText('I confirm I am subscribing on behalf of my employer, school or other professional organization for use by my institution\'s employees, students and/or other sponsored learners.');
    const [checkbox1, checkbox2, checkbox3] = checkboxes;
    expect(checkbox1).not.toBeChecked();
    expect(checkbox2).not.toBeChecked();
    expect(checkbox3).not.toBeChecked();
  });

  it('verifies links to term are present', async () => {
    renderComponent();

    const links = document.querySelectorAll('a');
    expect(links.length).toEqual(2);
    const [link1, link2] = links;

    expect(link1.getAttribute('href')).toEqual('https://example.com/product-terms');
    expect(link2.getAttribute('href')).toEqual('https://example.com/sales-terms');
  });

  it('checks the checkbox when clicked', async () => {
    const user = userEvent.setup();
    renderComponent();
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');

    expect(checkboxes.length).toEqual(3);
    const [checkbox1, checkbox2, checkbox3] = checkboxes;
    expect(checkbox1).not.toBeChecked();
    expect(checkbox2).not.toBeChecked();
    expect(checkbox3).not.toBeChecked();

    await user.click(checkbox1);
    expect(checkbox1).toBeChecked();
    expect(sendEnterpriseCheckoutTrackingEvent).toHaveBeenCalledTimes(1);

    await user.click(checkbox2);
    expect(checkbox2).toBeChecked();
    expect(sendEnterpriseCheckoutTrackingEvent).toHaveBeenCalledTimes(2);

    await user.click(checkbox3);
    expect(checkbox3).toBeChecked();
    expect(sendEnterpriseCheckoutTrackingEvent).toHaveBeenCalledTimes(3);
  });
});
