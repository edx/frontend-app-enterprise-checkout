import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { Card } from '@openedx/paragon';
import classNames from 'classnames';
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

  const headerClassName = classNames({
    'purchase-summary-header--essentials': isEssentials,
  });

  return (
    <Card.Header
      className={headerClassName}
      title={(
        <FormattedMessage
          id="checkout.purchaseSummary.header.title"
          defaultMessage="Purchase summary"
          description="Header title for purchase summary card"
        />
      )}
      subtitle={subtitle}
      size="md"
    />
  );
};

const PurchaseSummaryHeader = React.memo(PurchaseSummaryHeaderComponent);
export default PurchaseSummaryHeader;
