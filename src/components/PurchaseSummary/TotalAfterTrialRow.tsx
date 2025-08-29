import { FormattedMessage } from '@edx/frontend-platform/i18n';
import classNames from 'classnames';
import React from 'react';

import { DisplayPrice } from '@/components/DisplayPrice';

import SummaryRow from './SummaryRow';

interface TotalAfterTrialRowProps {
  quantity?: number | null;
  totalPerYear?: number | null;
}

const TotalAfterTrialRowComponent: React.FC<TotalAfterTrialRowProps> = ({ quantity, totalPerYear }) => (
  <div>
    <SummaryRow
      label={(
        <FormattedMessage
          id="checkout.purchaseSummary.totalPricePerYear.text"
          defaultMessage="Total after trial"
          description="Label for the total price for all users per year"
        />
      )}
      right={(
        <div
          className={classNames({
            'font-weight-bold': !!quantity && quantity > 0,
          })}
        >
          {quantity
            ? (
              <span>
                <DisplayPrice value={totalPerYear ?? 0} /> USD
              </span>
            )
            : ('-')}/yr
        </div>
      )}
      // @ts-ignore
      className={{ 'pb-4.5': !quantity }}
    />
  </div>
);

export default React.memo(TotalAfterTrialRowComponent);
