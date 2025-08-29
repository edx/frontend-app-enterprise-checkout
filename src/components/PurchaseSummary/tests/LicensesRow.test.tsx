import { IntlProvider } from '@edx/frontend-platform/i18n';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import React from 'react';

import LicensesRow from '../LicensesRow';

describe('LicensesRow', () => {
  const renderWithI18n = (ui: React.ReactElement) => render(<IntlProvider locale="en">{ui}</IntlProvider>);

  it('renders dash when quantity is absent', () => {
    renderWithI18n(<LicensesRow quantity={undefined} />);
    expect(screen.getByText('Number of licenses')).toBeInTheDocument();
    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('renders x{quantity} when quantity is provided', () => {
    renderWithI18n(<LicensesRow quantity={7} />);
    expect(screen.getByText('Number of licenses')).toBeInTheDocument();
    expect(screen.getByText('x7')).toBeInTheDocument();
  });
});
