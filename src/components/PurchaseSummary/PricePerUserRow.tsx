import { FormattedMessage } from '@edx/frontend-platform/i18n';
import React from 'react';

import { DisplayPrice } from '@/components/DisplayPrice';

import SummaryRow from './SummaryRow';

interface PricePerUserRowProps {
  pricePerUser?: number | null;
  label?: React.ReactNode;
}

const PricePerUserRowComponent: React.FC<PricePerUserRowProps> = ({
  pricePerUser,
  label,
}) => (
  <SummaryRow
    label={label ?? (
      <FormattedMessage
        id="checkout.purchaseSummary.yearlyPricePerUser.text"
        defaultMessage="Team Subscription, price per user, paid yearly"
        description="Label for the team plan per user per year"
      />
    )}
    right={pricePerUser == null
      ? (
        <FormattedMessage
          id="checkout.purchaseSummary.pricePerUser.empty"
          defaultMessage="-"
          description="Placeholder shown when per-user price is unavailable"
        />
      )
      : (
        <span>
          <DisplayPrice value={pricePerUser} /> USD
        </span>
      )}
    boldRight
    className="mb-3"
    style={{ width: 'min(100%, 353px)', minHeight: '56px', justifyContent: 'space-between' }}
  />
);

export default React.memo(PricePerUserRowComponent);
