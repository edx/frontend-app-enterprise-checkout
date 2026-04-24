import { IntlProvider } from '@edx/frontend-platform/i18n';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import PurchaseSummaryHeader from '../PurchaseSummaryHeader';

describe('PurchaseSummaryHeader', () => {
  const renderWithI18n = (ui: React.ReactElement) => render(<IntlProvider locale="en">{ui}</IntlProvider>);

  it('renders essentials subtitle with academy name when provided', () => {
    renderWithI18n(<PurchaseSummaryHeader headerName="AI Academy" isEssentials />);
    validateText('AI Academy');
    validateText('Purchase summary');
  });

  it('renders teams subtitle when header name is absent', () => {
    renderWithI18n(<PurchaseSummaryHeader headerName={undefined} />);
    validateText('Team subscription, price per user, paid yearly.');
    validateText('Purchase summary');
  });
});
