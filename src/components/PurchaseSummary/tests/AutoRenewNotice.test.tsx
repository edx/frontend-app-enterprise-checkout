import { IntlProvider } from '@edx/frontend-platform/i18n';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import AutoRenewNotice from '../AutoRenewNotice';

describe('AutoRenewNotice', () => {
  const renderWithI18n = (ui: React.ReactElement) => render(<IntlProvider locale="en">{ui}</IntlProvider>);

  it('does not render when quantity is falsy', () => {
    const { rerender } = renderWithI18n(<AutoRenewNotice quantity={undefined} totalPerYear={100} />);
    expect(screen.queryByText(/Auto-renews annually/i)).not.toBeInTheDocument();
    rerender(<IntlProvider locale="en"><AutoRenewNotice quantity={0} totalPerYear={100} /></IntlProvider>);
    expect(screen.queryByText(/Auto-renews annually/i)).not.toBeInTheDocument();
  });

  it('renders with price when quantity is provided', () => {
    renderWithI18n(<AutoRenewNotice quantity={2} totalPerYear={200} />);
    validateText(/Auto-renews annually/i);
    validateText('$200', { exact: false });
    validateText(/\/yr/);
  });
});
