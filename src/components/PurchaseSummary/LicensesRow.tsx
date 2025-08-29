import { FormattedMessage } from '@edx/frontend-platform/i18n';
import React from 'react';

import SummaryRow from './SummaryRow';

interface LicensesRowProps {
  quantity?: number | null;
}

const LicensesRowComponent: React.FC<LicensesRowProps> = ({ quantity }) => (
  <SummaryRow
    label={(
      <FormattedMessage
        id="checkout.purchaseSummary.licenses.text"
        defaultMessage="Number of licenses"
        description="Label for the number of licenses"
      />
    )}
    right={quantity ? `x${quantity}` : '-'}
  />
);

export default React.memo(LicensesRowComponent);
