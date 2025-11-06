import { IntlProvider } from '@edx/frontend-platform/i18n';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import PricePerUserRow from '../PricePerUserRow';

describe('PricePerUserRow', () => {
  const renderWithI18n = (ui: React.ReactElement) => render(<IntlProvider locale="en">{ui}</IntlProvider>);

  it('renders dash when pricePerUser is null/undefined', () => {
    renderWithI18n(<PricePerUserRow pricePerUser={null} />);
    validateText('Team Subscription, price per user, paid yearly');
    validateText('-');
  });

  it('renders formatted price when pricePerUser is provided', () => {
    renderWithI18n(<PricePerUserRow pricePerUser={50} />);
    validateText('Team Subscription, price per user, paid yearly');
    validateText('$50 USD');
  });
});
