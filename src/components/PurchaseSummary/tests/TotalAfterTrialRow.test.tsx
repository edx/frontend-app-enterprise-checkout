import { IntlProvider } from '@edx/frontend-platform/i18n';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import React from 'react';

import TotalAfterTrialRow from '../TotalAfterTrialRow';

describe('TotalAfterTrialRow', () => {
  const renderWithI18n = (ui: React.ReactElement) => render(<IntlProvider locale="en">{ui}</IntlProvider>);

  it('shows dash with /yr when quantity is not provided', () => {
    renderWithI18n(<TotalAfterTrialRow quantity={undefined} totalPerYear={undefined} />);
    expect(screen.getByText('Total after trial')).toBeInTheDocument();
    expect(screen.getByText('-/yr')).toBeInTheDocument();
  });

  it('shows formatted total with USD and /yr when quantity > 0', () => {
    renderWithI18n(<TotalAfterTrialRow quantity={3} totalPerYear={300} />);
    expect(screen.getByText('Total after trial')).toBeInTheDocument();
    expect(screen.getByText('$300', { exact: false })).toBeInTheDocument();
    expect(screen.getByText('USD', { exact: false })).toBeInTheDocument();
    expect(screen.getByText(/\/yr/)).toBeInTheDocument();
  });
});
