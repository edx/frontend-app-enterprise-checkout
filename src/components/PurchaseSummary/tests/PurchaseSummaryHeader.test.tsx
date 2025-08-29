import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import React from 'react';

import PurchaseSummaryHeader from '../PurchaseSummaryHeader';

describe('PurchaseSummaryHeader', () => {
  it('renders subtitle with company name when provided', () => {
    render(<PurchaseSummaryHeader companyName="Acme Corp" />);
    expect(screen.getByText('For Acme Corp')).toBeInTheDocument();
    expect(screen.getByText('Purchase summary')).toBeInTheDocument();
  });

  it('renders dash when company name is absent', () => {
    render(<PurchaseSummaryHeader companyName={undefined} />);
    expect(screen.getByText('-')).toBeInTheDocument();
  });
});
