import { Outlet, ScrollRestoration } from 'react-router-dom';

import { useNProgressLoader } from './data';

const Root = () => {
  const isAppDataHydrated = useNProgressLoader();

  if (!isAppDataHydrated) {
    return null;
  }

  return (
    <>
      <Outlet />
      <ScrollRestoration />
    </>
  );
};

export default Root;
