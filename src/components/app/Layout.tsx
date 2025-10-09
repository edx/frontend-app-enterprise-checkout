import { Helmet } from 'react-helmet';
import { Outlet, ScrollRestoration } from 'react-router-dom';

import Header from '@/components/Header/Header';

import { Footer } from '../Footer';

const Layout: React.FC = () => (
  <div id="layout">
    <Helmet titleTemplate="Checkout - %s" />
    <Header />
    <Outlet />
    <Footer />
    <ScrollRestoration />
  </div>
);

export default Layout;
