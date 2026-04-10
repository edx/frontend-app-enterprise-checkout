import { FormattedMessage } from '@edx/frontend-platform/i18n';
import React from 'react';

import { DisplayPrice } from '@/components/DisplayPrice';

import SummaryRow from './SummaryRow';

interface PricePerUserRowProps {
  pricePerUser?: number | null;
  isEssentials?: boolean;
}

const PricePerUserRowComponent: React.FC<PricePerUserRowProps> = ({ pricePerUser, isEssentials }) => (
  <SummaryRow
    label={isEssentials ? (
      <FormattedMessage
        id="checkout.purchaseSummary.essentialsPricePerUser.text"
        defaultMessage="Essentials subscription, price per user, paid yearly"
        description="Label for the essentials plan per user per year"
      />
    ) : (
      <FormattedMessage
        id="checkout.purchaseSummary.yearlyPricePerUser.text"
        defaultMessage="Team Subscription, price per user, paid yearly"
        description="Label for the team plan per user per year"
      />
    )}
    right={pricePerUser == null ? '-' : <span><DisplayPrice value={pricePerUser} /> USD</span>}
    boldRight
    className="mb-3"
  />
);

export default React.memo(PricePerUserRowComponent);
