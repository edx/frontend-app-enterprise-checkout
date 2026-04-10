import { IntlProvider } from '@edx/frontend-platform/i18n';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import PurchaseSummaryHeader from '../PurchaseSummaryHeader';

describe('PurchaseSummaryHeader', () => {
  const renderWithI18n = (ui: React.ReactElement) => render(<IntlProvider locale="en">{ui}</IntlProvider>);

  it('renders subtitle with company name when provided', () => {
    renderWithI18n(<PurchaseSummaryHeader companyName="Acme Corp" isEssentials />);
    validateText('Acme Corp');
    validateText('Purchase summary');
  });

  it('renders purchase summary when company name is absent', () => {
    renderWithI18n(<PurchaseSummaryHeader companyName={undefined} isEssentials />);
    validateText('Purchase summary');
  });
});
