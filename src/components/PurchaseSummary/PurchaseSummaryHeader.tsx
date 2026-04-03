import { Card } from '@openedx/paragon';
import React from 'react';

interface PurchaseSummaryHeaderProps {
  companyName?: string | null;
  isEssentials?: boolean;
}

const PurchaseSummaryHeaderComponent: React.FC<PurchaseSummaryHeaderProps> = ({ companyName, isEssentials }) => {
  let subtitle: string | undefined;
  if (isEssentials) {
    subtitle = companyName || undefined;
  } else {
    subtitle = companyName
      ? `${companyName} • Team subscription, price per user, paid yearly.`
      : 'Team subscription, price per user, paid yearly.';
  }

  return (
    <Card.Header
      title={<span className="font-weight-bold">Purchase summary</span>}
      subtitle={subtitle}
      size="md"
    />
  );
};

const PurchaseSummaryHeader = React.memo(PurchaseSummaryHeaderComponent);
export default PurchaseSummaryHeader;
