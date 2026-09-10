import { getConfig } from '@edx/frontend-platform/config';
import { defineMessages, FormattedMessage } from '@edx/frontend-platform/i18n';
import { AvatarButton, Dropdown } from '@openedx/paragon';
import { useMemo } from 'react';

const messages = defineMessages({
  profile: {
    id: 'header.userMenu.profile',
    defaultMessage: 'Profile',
    description: 'Link to the user profile page',
  },
  account: {
    id: 'header.userMenu.account',
    defaultMessage: 'Account',
    description: 'Link to the user account settings page',
  },
  signOut: {
    id: 'header.userMenu.signOut',
    defaultMessage: 'Sign Out',
    description: 'Link to log the user out',
  },
});

interface UserMenuProps { user: AuthenticatedUser }

const UserMenu = ({ user }: UserMenuProps) => {
  const config = getConfig();
  const {
    LMS_BASE_URL,
    LOGOUT_URL,
    ACCOUNT_PROFILE_URL = LMS_BASE_URL,
    ACCOUNT_SETTINGS_URL = `${LMS_BASE_URL}/account/settings`,
  } = config;
  const { username, name, email } = user;
  const profileImage = user.profile_image?.image_url_medium;
  const profileUrl = `${ACCOUNT_PROFILE_URL}/u/${username}`;
  const accountUrl = ACCOUNT_SETTINGS_URL;
  const logoutUrl = LOGOUT_URL;

  const displayName = name || username;

  const metaBlock = useMemo(() => (
    <div className="small text-left" style={{ maxWidth: 240 }}>
      <div className="font-weight-bold" data-testid="user-full-name">{displayName}</div>
      {email && <div className="text-muted" data-testid="user-email" style={{ wordBreak: 'break-all' }}>{email}</div>}
    </div>
  ), [displayName, email]);

  return (
    <Dropdown className="ml-2" data-testid="user-menu">
      <Dropdown.Toggle
        as={AvatarButton}
        id="checkout-header-avatar-dropdown"
        src={profileImage}
        className="text-white"
        variant="primary-900"
        showLabel
      >
        {username}
      </Dropdown.Toggle>
      <Dropdown.Menu alignRight style={{ maxWidth: 280 }}>
        <Dropdown.Header>
          {metaBlock}
        </Dropdown.Header>
        <Dropdown.Item href={profileUrl} data-testid="user-profile-link">
          <FormattedMessage {...messages.profile} />
        </Dropdown.Item>
        <Dropdown.Item href={accountUrl} data-testid="user-account-link">
          <FormattedMessage {...messages.account} />
        </Dropdown.Item>
        <Dropdown.Divider />
        <Dropdown.Item href={logoutUrl} data-testid="user-logout-link">
          <FormattedMessage {...messages.signOut} />
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default UserMenu;
