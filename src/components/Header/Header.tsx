import { defineMessages, useIntl } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';
import { Container, Image, Navbar } from '@openedx/paragon';
import { useContext, useMemo } from 'react';
import { Link } from 'react-router-dom';

import edxEnterpriseLogo from './images/edx-enterprise.svg';
import UserMenu from './UserMenu/UserMenu';

const messages = defineMessages({
  logoAlt: {
    id: 'header.logo.alt',
    defaultMessage: 'edX for Business logo',
    description: 'Alt text for the edX for Business logo in the header',
  },
});

const Header: React.FC = () => {
  const { authenticatedUser } = useContext(AppContext) as AppContextValue;
  const intl = useIntl();

  const hasUser = Boolean(authenticatedUser && authenticatedUser.username);

  const brand = useMemo(() => (
    <div className="navbar__brand" data-testid="header-brand">
      <Link to="/">
        <Image
          src={edxEnterpriseLogo}
          alt={intl.formatMessage(messages.logoAlt)}
          style={{ maxWidth: 200 }}
          fluid
        />
      </Link>
    </div>
  ), [intl]);

  return (
    <header className="checkout-header" role="banner">
      <Navbar variant="dark" expand="lg" className="bg-dark-900">
        <Container size="lg" className="py-3 d-flex align-items-center justify-content-between">
          {brand}
          {hasUser && (
            <div data-testid="header-user-menu">
              <UserMenu user={authenticatedUser} />
            </div>
          )}
        </Container>
      </Navbar>
    </header>
  );
};

export default Header;
