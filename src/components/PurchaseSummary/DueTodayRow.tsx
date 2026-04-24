import { FormattedMessage } from '@edx/frontend-platform/i18n';
import React from 'react';

import { DisplayPrice } from '@/components/DisplayPrice';

import SummaryRow from './SummaryRow';

interface DueTodayRowProps {
  amountDue: number;
}

const DueTodayRowComponent: React.FC<DueTodayRowProps> = ({ amountDue }) => (
  <SummaryRow
    label={(
      <strong>
        <FormattedMessage
          id="checkout.purchaseSummary.dueToday.text"
          defaultMessage="Due today"
          description="Label for the amount due by the user on successful checkout"
        />
      </strong>
    )}
    right={(
      <strong>
        <DisplayPrice value={amountDue} />
      </strong>
    )}
    className="justify-content-between"
  />
);

export default React.memo(DueTodayRowComponent);
