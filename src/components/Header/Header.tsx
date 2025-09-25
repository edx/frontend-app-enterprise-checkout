import { Container, Image, Navbar } from '@openedx/paragon';
import { Link } from 'react-router-dom';

import edxLogo from '@/assets/images/edx-enterprise.svg';

const Header: React.FC = () => (
  <header>
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container size="lg" className="py-3">
        <div className="navbar__brand">
          <Link to="/">
            <Image
              src={edxLogo}
              alt="edX for Business logo"
              style={{ maxWidth: 200 }}
              fluid
            />
          </Link>
        </div>
        {/* TODO: When authenticated, user dropdown menu */}
      </Container>
    </Navbar>
  </header>
);

export default Header;
