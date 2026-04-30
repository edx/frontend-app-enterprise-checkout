import { Button, Icon } from '@openedx/paragon';
import { Lock } from '@openedx/paragon/icons';
import React from 'react';
import { FormattedMessage } from 'react-intl';

const UpgradeToTeamsButton: React.FC = () => (
  <Button
    variant="outline-danger"
    className="w-100 d-inline-flex align-items-center justify-content-center gap-2"
    data-testid="upgrade-to-teams-button"
  >
    <Icon src={Lock} className="text-danger" />
    <span className="text-danger font-weight-medium">
      <FormattedMessage
        id="components.PurchaseSummary.UpgradeToTeamsButton.upgradeToTeams"
        defaultMessage="Upgrade to Teams"
        description="Button text to upgrade to Teams plan"
      />
    </span>
  </Button>
);

export default React.memo(UpgradeToTeamsButton);
