import { Button, Icon } from '@openedx/paragon';
import { Lock } from '@openedx/paragon/icons';
import React from 'react';
import { FormattedMessage } from 'react-intl';

const UPGRADE_TO_TEAMS_URL = 'https://business.edx.org/course-library-plans-teams/';

const UpgradeToTeamsButton: React.FC = () => (
  <Button
    variant="light"
    className="w-100 d-inline-flex align-items-center justify-content-center gap-2 text-dark"
    data-testid="upgrade-to-teams-button"
    href={UPGRADE_TO_TEAMS_URL}
    target="_blank"
    rel="noopener noreferrer"
    style={{
      color: '#333333',
      background: '#FFFFFF',
      border: '1px solid #F2F0EF',
    }}
  >
    <Icon src={Lock} style={{ color: '#D23228' }} />
    <span className="text-dark font-weight-medium">
      <FormattedMessage
        id="components.PurchaseSummary.UpgradeToTeamsButton.upgradeToTeams"
        defaultMessage="Upgrade to Teams"
        description="Button text to upgrade to Teams plan"
      />
    </span>
  </Button>
);

export default React.memo(UpgradeToTeamsButton);
