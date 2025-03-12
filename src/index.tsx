import 'core-js/stable';

import ReactDOM from 'react-dom';
import {
  APP_INIT_ERROR, APP_READY, subscribe, initialize,
} from '@edx/frontend-platform';
import {
  AppProvider, AuthenticatedPageRoute, ErrorPage, PageWrap,
} from '@edx/frontend-platform/react';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';

import messages from './i18n';

import Layout from './components/Layout';
import CheckoutPage from './components/CheckoutPage';
import ConfirmationPage from './components/ConfirmationPage';

import './index.scss';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Navigate to="checkout" replace />,
      },
      {
        path: 'checkout/:step?',
        element: (
          <PageWrap>
            <CheckoutPage />
          </PageWrap>
        ),
      },
      {
        path: 'checkout/confirmation',
        element: (
          <AuthenticatedPageRoute>
            <ConfirmationPage />
          </AuthenticatedPageRoute>
        ),
      },
    ],
  },
]);

subscribe(APP_READY, () => {
  ReactDOM.render(
    <AppProvider wrapWithRouter={false}>
      <RouterProvider router={router} />
    </AppProvider>,
    document.getElementById('root'),
  );
});

subscribe(APP_INIT_ERROR, (error) => {
  ReactDOM.render(<ErrorPage message={error.message} />, document.getElementById('root'));
});

initialize({
  messages,
});
