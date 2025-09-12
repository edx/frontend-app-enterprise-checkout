import { IntlProvider } from '@edx/frontend-platform/i18n';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import { useForm } from 'react-hook-form';

import TermsAndConditions from '../../billing-details-pages/TermsAndConditions';

const TestWrapper: React.FC = () => {
  const form = useForm<BillingDetailsData>({
    mode: 'onTouched',
    defaultValues: {
      confirmTnC: false,
      confirmSubscription: false,
      termsAndConditionAccepted: false,
    } as any,
  });
  return <TermsAndConditions form={form} />;
};

describe('TermsAndConditions', () => {
  const renderComponent = () => render(
    <IntlProvider locale="en">
      <TestWrapper />
    </IntlProvider>,
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
});
