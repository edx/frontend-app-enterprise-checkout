import { Card, Stack } from '@openedx/paragon';
import React, { ReactNode } from 'react';

import AutoRenewNotice from './AutoRenewNotice';
import DueTodayRow from './DueTodayRow';
import LicensesRow from './LicensesRow';
import PricePerUserRow from './PricePerUserRow';
import PurchaseSummaryHeader from './PurchaseSummaryHeader';
import TotalAfterTrialRow from './TotalAfterTrialRow';

type PurchaseSummaryBaseProps = {
  headerName?: string | null;
  isEssentials?: boolean;
  pricePerUser?: number | null;
  priceLabel?: string;
  quantity?: number | null;
  totalPerYear?: number | null;
  amountDue?: number;
  actionButton?: ReactNode;
};

const PurchaseSummaryBase = ({
  headerName,
  isEssentials = false,
  pricePerUser,
  priceLabel,
  quantity,
  totalPerYear,
  amountDue = 0,
  actionButton,
}: PurchaseSummaryBaseProps) => {
  const card = (
    <Card className={isEssentials ? 'border border-secondary' : undefined}>
      <PurchaseSummaryHeader headerName={headerName} isEssentials={isEssentials} />

      <Card.Section className="pt-2">
        <Stack gap={3}>
          <PricePerUserRow pricePerUser={pricePerUser} label={priceLabel} />
          <LicensesRow quantity={quantity} />

          <hr className="w-100" />

          <TotalAfterTrialRow quantity={quantity} totalPerYear={totalPerYear} />
          <AutoRenewNotice quantity={quantity} totalPerYear={totalPerYear} />
          <DueTodayRow amountDue={amountDue} />
        </Stack>
      </Card.Section>

      {actionButton && (
        <Card.Footer>
          {actionButton}
        </Card.Footer>
      )}
    </Card>
  );

  return card;
};

export default React.memo(PurchaseSummaryBase);
