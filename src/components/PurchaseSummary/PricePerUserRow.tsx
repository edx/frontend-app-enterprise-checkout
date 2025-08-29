import { FormattedMessage } from '@edx/frontend-platform/i18n';
import React from 'react';

import { DisplayPrice } from '@/components/DisplayPrice';

import SummaryRow from './SummaryRow';

interface PricePerUserRowProps {
  pricePerUser?: number | null;
}

const PricePerUserRowComponent: React.FC<PricePerUserRowProps> = ({ pricePerUser }) => (
  <SummaryRow
    label={(
      <FormattedMessage
        id="checkout.purchaseSummary.yearlyPricePerUser.text"
        defaultMessage="Team Subscription, price per user, paid yearly"
        description="Label for the team plan per user per year"
      />
    )}
    right={pricePerUser == null ? '-' : <DisplayPrice value={pricePerUser} />}
    boldRight
  />
);

export default React.memo(PricePerUserRowComponent);
