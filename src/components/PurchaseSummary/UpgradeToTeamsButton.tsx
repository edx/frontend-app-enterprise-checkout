import { Button, Icon } from '@openedx/paragon';
import { Lock } from '@openedx/paragon/icons';
import React from 'react';
import { FormattedMessage } from 'react-intl';

const UpgradeToTeamsButton: React.FC = () => (
  <Button
    variant="outline-danger"
    className="w-100 text-danger upgrade-to-teams-btn"
    data-testid="upgrade-to-teams-button"
  >
    <Icon src={Lock} className="me-2" style={{ color: '#dc3545' }} />
    <span className="upgrade-to-teams-label">
      <FormattedMessage
        id="components.PurchaseSummary.UpgradeToTeamsButton.upgradeToTeams"
        defaultMessage="Upgrade to Teams"
        description="Button text to upgrade to Teams plan"
      />
    </span>
  </Button>
);

export default React.memo(UpgradeToTeamsButton);
