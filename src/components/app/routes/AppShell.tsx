import { Outlet } from 'react-router-dom';

import 'accessible-nprogress/src/styles.css';
import { useNProgressController } from '@/components/app/data';

/**
 * AppShell mounts global route effects (e.g., NProgress controller) and renders the nested routes.
 *
 * @returns {JSX.Element} The router's nested outlet content.
 */
const AppShell = (): JSX.Element => {
  useNProgressController();
  return <Outlet />;
};

export default AppShell;
