import { Card } from '@openedx/paragon';
import React from 'react';

interface PurchaseSummaryHeaderProps {
  headerName?: string | null;
  isEssentials?: boolean;
}

const PurchaseSummaryHeaderComponent: React.FC<PurchaseSummaryHeaderProps> = ({
  headerName,
  isEssentials,
}) => {
  let subtitle: string | undefined;

  if (isEssentials) {
    subtitle = headerName || undefined;
  } else {
    subtitle = headerName
      ? `${headerName} • Team subscription, price per user, paid yearly.`
      : 'Team subscription, price per user, paid yearly.';
  }

  return (
    <Card.Header
      title={<span className="font-weight-bold">Purchase summary</span>}
      subtitle={subtitle && <span className="purchase-summary-header-name">{subtitle}</span>}
      size="md"
    />
  );
};

const PurchaseSummaryHeader = React.memo(PurchaseSummaryHeaderComponent);
export default PurchaseSummaryHeader;
