import { IntlProvider } from '@edx/frontend-platform/i18n';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import { SUBSCRIPTION_TRIAL_LENGTH_DAYS } from '@/components/app/data/constants';
import { generateTestPermutations } from '@/utils/tests';

import TotalAfterTrialRow from '../TotalAfterTrialRow';

describe('TotalAfterTrialRow', () => {
  const renderWithI18n = (ui: React.ReactElement) => render(<IntlProvider locale="en">{ui}</IntlProvider>);

  it.each(generateTestPermutations({
    quantity: [0, undefined, null],
    totalPerYear: [0, undefined, null],
  }))('shows dash with /yr when quantity or total per year is not provided (%s)', ({
    totalPerYear,
    quantity,
  }: { quantity?: number | null, totalPerYear?: number | null }) => {
    renderWithI18n(<TotalAfterTrialRow quantity={quantity} totalPerYear={totalPerYear} />);
    validateText(`Total after ${SUBSCRIPTION_TRIAL_LENGTH_DAYS}-day free trial`);
    validateText('-/yr');
  });

  it('shows formatted total with USD and /yr when quantity > 0', () => {
    renderWithI18n(<TotalAfterTrialRow quantity={3} totalPerYear={300} />);
    validateText(`Total after ${SUBSCRIPTION_TRIAL_LENGTH_DAYS}-day free trial`);
    validateText('$300', { exact: false });
    validateText('USD', { exact: false });
    validateText(/\/yr/);
  });
});
