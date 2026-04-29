import classNames from 'classnames';
 import { Card } from '@openedx/paragon';
 import { FormattedMessage } from '@edx/frontend-platform/i18n';
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

  const subtitleClassName = classNames({
    'purchase-summary-header-name': isEssentials,
  });

  return (
    <Card.Header
      title={(
        <FormattedMessage
          id="checkout.purchaseSummary.header.title"
          defaultMessage="Purchase summary"
          description="Header title for purchase summary card"
        />
      )}
      subtitle={subtitle ? <span className={subtitleClassName}>{subtitle}</span> : undefined}
      size="md"
    />
  );
};

const PurchaseSummaryHeader = React.memo(PurchaseSummaryHeaderComponent);
export default PurchaseSummaryHeader;
