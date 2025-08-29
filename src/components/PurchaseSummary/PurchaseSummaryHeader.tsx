import { Card } from '@openedx/paragon';
import React from 'react';

interface PurchaseSummaryHeaderProps {
  companyName?: string | null;
}

const PurchaseSummaryHeaderComponent: React.FC<PurchaseSummaryHeaderProps> = ({ companyName }) => (
  <Card.Header
    title="Purchase summary"
    subtitle={companyName ? `For ${companyName}` : '-'}
    size="md"
  />
);

const PurchaseSummaryHeader = React.memo(PurchaseSummaryHeaderComponent);
export default PurchaseSummaryHeader;
