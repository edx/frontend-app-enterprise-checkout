import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import PurchaseSummaryHeader from '../PurchaseSummaryHeader';

describe('PurchaseSummaryHeader', () => {
  it('renders subtitle with company name when provided', () => {
    render(<PurchaseSummaryHeader companyName="Acme Corp" />);
    validateText('For Acme Corp');
    validateText('Purchase summary');
  });

  it('renders dash when company name is absent', () => {
    render(<PurchaseSummaryHeader companyName={undefined} />);
    validateText('-');
  });
});
