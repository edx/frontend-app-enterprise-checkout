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
        id="checkout.purchaseSummary.pricePerUser.label"
        defaultMessage="Price per user, paid yearly"
        description="Label for the per-user annual subscription price"
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
          <DisplayPrice value={pricePerUser} />{' '}
          <FormattedMessage
            id="checkout.purchaseSummary.currencyCode.usd"
            defaultMessage="USD"
            description="ISO currency code shown after formatted prices"
          />
        </span>
      )}
    boldRight
    className="mb-3"
  />
);

export default React.memo(PricePerUserRowComponent);
