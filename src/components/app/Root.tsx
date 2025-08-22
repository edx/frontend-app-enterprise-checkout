import { Outlet, ScrollRestoration } from 'react-router-dom';

const Root = () => (
  <>
    <Outlet />
    <ScrollRestoration />
  </>
);

export default Root;
