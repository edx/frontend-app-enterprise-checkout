import { Lock } from '@openedx/paragon/icons';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import { ExternalLink } from '@/components/ExternalLink';

const UPGRADE_TO_TEAMS_URL = 'https://business.edx.org/course-library-plans-teams/';

const UpgradeToTeamsButton: React.FC = () => (
  <ExternalLink
    variant="button"
    buttonVariant="light"
    className="w-100 d-inline-flex align-items-center justify-content-center gap-2 text-dark"
    dataTestId="upgrade-to-teams-button"
    href={UPGRADE_TO_TEAMS_URL}
    iconBefore={Lock as React.ComponentType<{}>}
    iconBeforeStyle={{ color: '#D23228' }}
    style={{
      color: '#333333',
      background: '#FFFFFF',
      border: '1px solid #F2F0EF',
    }}
  >
    <span className="text-dark font-weight-medium">
      <FormattedMessage
        id="components.PurchaseSummary.UpgradeToTeamsButton.upgradeToTeams"
        defaultMessage="Upgrade to Teams"
        description="Button text to upgrade to Teams plan"
      />
    </span>
  </ExternalLink>
);

export default React.memo(UpgradeToTeamsButton);
