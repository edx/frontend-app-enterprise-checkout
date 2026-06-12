import { getConfig } from '@edx/frontend-platform/config';
import { Helmet } from 'react-helmet';
import { Outlet, ScrollRestoration } from 'react-router-dom';

import Header from '@/components/Header/Header';
import SystemWideWarningBanner from '@/components/SystemWideWarningBanner/SystemWideWarningBanner';
import { isSystemMaintenanceAlertOpen } from '@/components/SystemWideWarningBanner/utils';

import { Footer } from '../Footer';

const Layout: React.FC = () => {
  const config = getConfig();
  console.log(isSystemMaintenanceAlertOpen(config));
  return (
    <div id="layout">
      <Helmet titleTemplate="Checkout - %s" />
      {isSystemMaintenanceAlertOpen(config) && (
        <SystemWideWarningBanner>
          {config.MAINTENANCE_ALERT_MESSAGE}
        </SystemWideWarningBanner>
      )}
      <Header />
      <Outlet />
      <Footer />
      <ScrollRestoration />
    </div>
  );
};

export default Layout;
