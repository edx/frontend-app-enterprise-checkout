import { IntlProvider } from '@edx/frontend-platform/i18n';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import React from 'react';

import DueTodayRow from '../DueTodayRow';

describe('DueTodayRow', () => {
  const renderWithI18n = (ui: React.ReactElement) => render(<IntlProvider locale="en">{ui}</IntlProvider>);

  it('renders label and formatted amount', () => {
    renderWithI18n(<DueTodayRow amountDue={123} />);
    expect(screen.getByText('Due today')).toBeInTheDocument();
    expect(screen.getByText('$123')).toBeInTheDocument();
  });
});
