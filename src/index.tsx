import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import {
  APP_INIT_ERROR, APP_READY, subscribe, initialize,
} from '@edx/frontend-platform';
import {
  AppProvider, AuthenticatedPageRoute, ErrorPage, PageWrap,
} from '@edx/frontend-platform/react';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';

import messages from './i18n';

import Layout from '@/components/app/Layout';
import CheckoutPage from './components/CheckoutPage';
import ConfirmationPage from './components/ConfirmationPage';

import './index.scss';

const router = createBrowserRouter([ // Data router
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

const container = document.getElementById('root');
const root = createRoot(container);

subscribe(APP_READY, () => {
  root.render(
    <StrictMode>
      <AppProvider wrapWithRouter={false}>
        <RouterProvider router={router} />
      </AppProvider>,
    </StrictMode>,
  );
});

subscribe(APP_INIT_ERROR, (error) => {
  root.render(
    <StrictMode>
      <ErrorPage message={error.message} />
    </StrictMode>,
  );
});

initialize({
  messages,
});
