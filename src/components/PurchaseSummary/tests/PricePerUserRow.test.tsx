import { IntlProvider } from '@edx/frontend-platform/i18n';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import React from 'react';

import PricePerUserRow from '../PricePerUserRow';

describe('PricePerUserRow', () => {
  const renderWithI18n = (ui: React.ReactElement) => render(<IntlProvider locale="en">{ui}</IntlProvider>);

  it('renders dash when pricePerUser is null/undefined', () => {
    renderWithI18n(<PricePerUserRow pricePerUser={null} />);
    expect(screen.getByText('Team Subscription, price per user, paid yearly')).toBeInTheDocument();
    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('renders formatted price when pricePerUser is provided', () => {
    renderWithI18n(<PricePerUserRow pricePerUser={50} />);
    expect(screen.getByText('Team Subscription, price per user, paid yearly')).toBeInTheDocument();
    expect(screen.getByText('$50')).toBeInTheDocument();
  });
});
