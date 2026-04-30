import { IntlProvider } from '@edx/frontend-platform/i18n';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import PurchaseSummaryHeader from '../PurchaseSummaryHeader';

const MockPurchaseSummaryHeader = ({
  headerName = null,
  isEssentials = false,
}: {
  headerName?: string | null;
  isEssentials?: boolean;
}) => (
  <IntlProvider locale="en">
    <PurchaseSummaryHeader
      headerName={headerName}
      isEssentials={isEssentials}
    />
  </IntlProvider>
);

describe('PurchaseSummaryHeader', () => {
  it('renders essentials subtitle with academy name when provided', () => {
    render(<MockPurchaseSummaryHeader headerName="AI Academy" isEssentials />);
    validateText('AI Academy');
    validateText('Purchase summary');
  });

  it('renders teams subtitle when header name is absent', () => {
    render(<MockPurchaseSummaryHeader />);
    validateText('-');
    validateText('Purchase summary');
  });
});
