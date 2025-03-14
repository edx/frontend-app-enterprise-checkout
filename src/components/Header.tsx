import { Link } from 'react-router-dom';
import { Container, Image, Navbar } from '@openedx/paragon';

const Header: React.FC = () => (
  <header>
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container size="lg" className="py-3">
        <div className="navbar__brand">
          <Link to="/">
            <Image
              src="https://business.edx.org/wp-content/uploads/2023/09/edX-For-Business_logo_horizontal_white_337%E2%80%8A%C3%97%E2%80%8A64_x2-2.png"
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
