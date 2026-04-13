import React from 'react';

import { DisplayPrice } from '@/components/DisplayPrice';

import SummaryRow from './SummaryRow';

interface PricePerUserRowProps {
  pricePerUser?: number | null;
  label?: string;
}

const PricePerUserRowComponent: React.FC<PricePerUserRowProps> = ({
  pricePerUser,
  label = 'Price per user, paid yearly',
}) => (
  <SummaryRow
    label={label}
    right={pricePerUser == null ? '-' : <span><DisplayPrice value={pricePerUser} /> USD</span>}
    boldRight
    className="mb-3"
  />
);

export default React.memo(PricePerUserRowComponent);
