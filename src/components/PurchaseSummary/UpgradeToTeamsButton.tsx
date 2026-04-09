import { Button, Icon } from '@openedx/paragon';
import { Lock } from '@openedx/paragon/icons';
import React from 'react';
import { FormattedMessage } from 'react-intl';

const UpgradeToTeamsButton: React.FC = () => (
  <Button
    variant="primary"
    className="w-100"
    data-testid="upgrade-to-teams-button"
    disabled
  >
    <Icon src={Lock} className="me-2" />
    <FormattedMessage
      id="components.PurchaseSummary.UpgradeToTeamsButton.upgradeToTeams"
      defaultMessage="Upgrade to Teams"
      description="Button text to upgrade to Teams plan"
    />
  </Button>
);

export default React.memo(UpgradeToTeamsButton);
