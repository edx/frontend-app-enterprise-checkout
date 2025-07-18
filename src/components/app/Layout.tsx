import FooterSlot from '@openedx/frontend-slot-footer';
import { Helmet } from 'react-helmet';
import { Outlet, ScrollRestoration } from 'react-router-dom';

import Header from '@/components/Header/Header';

const Layout: React.FC = () => (
  <div id="layout">
    <Helmet titleTemplate="Checkout - %s" />
    <Header />
    <Outlet />
    <FooterSlot />
    <ScrollRestoration />
  </div>
);

export default Layout;
