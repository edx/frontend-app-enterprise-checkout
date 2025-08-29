import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { Stack } from '@openedx/paragon';
import React from 'react';

import { DisplayPrice } from '@/components/DisplayPrice';

interface AutoRenewNoticeProps {
  quantity?: number | null;
  totalPerYear?: number | null;
}

const AutoRenewNoticeComponent: React.FC<AutoRenewNoticeProps> = ({ quantity, totalPerYear }) => {
  if (!quantity) {
    return null;
  }
  return (
    <Stack gap={6} direction="horizontal" className="align-self-end w-75 text-right">
      <FormattedMessage
        id="checkout.purchaseSummary.a.text"
        defaultMessage="Auto-renews annually at {price}/yr. Cancel at any time."
        description="Auto renew disclaimer indicating price and cancellation"
        values={{
          price: <DisplayPrice value={totalPerYear ?? 0} />,
        }}
      />
    </Stack>
  );
};

export default React.memo(AutoRenewNoticeComponent);
