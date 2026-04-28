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
    subtitle = headerName || '-';
  } else {
    subtitle = headerName ? `For ${headerName}` : '-';
  }

  return (
    <Card.Header
      title={isEssentials ? <span className="font-weight-bold">Purchase summary</span> : 'Purchase summary'}
      subtitle={isEssentials
        ? (subtitle && <span className="purchase-summary-header-name">{subtitle}</span>)
        : subtitle}
      size="md"
    />
  );
};

const PurchaseSummaryHeader = React.memo(PurchaseSummaryHeaderComponent);
export default PurchaseSummaryHeader;
