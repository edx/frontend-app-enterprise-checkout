import { IntlProvider } from '@edx/frontend-platform/i18n';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';

import '@testing-library/jest-dom';
import RouteErrorPage, { getErrorMessage } from '../RouteErrorPage';

jest.mock('@edx/frontend-platform/config', () => ({
  getConfig: jest.fn().mockReturnValue({
    COMPARE_ENTERPRISE_PLANS_URL: 'https://compare.example.com',
  }),
}));

// Renders RouteErrorPage as a real errorElement inside a data router, so useRouteError()
// has the context it requires. IntlProvider wraps the errorElement itself since
// RouterProvider does not supply one (in the app, AppProvider wraps RouterProvider instead).
const renderWithThrowingLoader = (loader: () => never) => {
  const router = createMemoryRouter([
    {
      path: '/',
      loader,
      errorElement: (
        <IntlProvider locale="en">
          <RouteErrorPage message="Error Boundary" />
        </IntlProvider>
      ),
    },
  ], { initialEntries: ['/'] });

  return render(<RouterProvider router={router} />);
};

describe('RouteErrorPage', () => {
  it('displays the message and stack trace from a thrown Error', async () => {
    renderWithThrowingLoader(() => {
      const error = new Error('Loader exploded');
      error.stack = 'at loader (foo.ts:1:1)';
      throw error;
    });

    expect(await screen.findByText('Loader exploded')).toBeInTheDocument();
    expect(screen.getByText('at loader (foo.ts:1:1)')).toBeInTheDocument();
  });

  it('displays a thrown string as the message', async () => {
    renderWithThrowingLoader(() => {
      // eslint-disable-next-line @typescript-eslint/no-throw-literal
      throw 'Something broke';
    });

    expect(await screen.findByText('Something broke')).toBeInTheDocument();
  });

  it('falls back to the message prop for an unknown thrown value', async () => {
    renderWithThrowingLoader(() => {
      // eslint-disable-next-line @typescript-eslint/no-throw-literal
      throw 12345;
    });

    expect(await screen.findByText('Error Boundary')).toBeInTheDocument();
  });
});

// isRouteErrorResponse duck-types an ErrorResponseImpl shape ({ status, statusText, internal,
// data }), which is what React Router's data router constructs internally when a loader/action
// throws a `Response`. Unit-testing getErrorMessage() directly against that shape avoids
// depending on jsdom/whatwg-fetch's Response body-stream behavior in the router's own
// Response-to-ErrorResponseImpl conversion.
describe('getErrorMessage', () => {
  it('reads a string data payload from a route error response', () => {
    const routeErrorResponse = {
      status: 500,
      statusText: 'Internal Server Error',
      internal: false,
      data: 'Response error message',
    };

    expect(getErrorMessage(routeErrorResponse)).toBe('Response error message');
  });

  it('reads a message field from an object data payload', () => {
    const routeErrorResponse = {
      status: 500,
      statusText: 'Internal Server Error',
      internal: false,
      data: { message: 'Response object error message' },
    };

    expect(getErrorMessage(routeErrorResponse)).toBe('Response object error message');
  });

  it('falls back to status text when the data payload has no usable message', () => {
    const routeErrorResponse = {
      status: 404,
      statusText: 'Not Found',
      internal: false,
      data: { some: 'other' },
    };

    expect(getErrorMessage(routeErrorResponse)).toBe('404 Not Found');
  });

  it('reads the message from an Error instance', () => {
    expect(getErrorMessage(new Error('Boom'))).toBe('Boom');
  });

  it('returns a plain string as-is', () => {
    expect(getErrorMessage('Something broke')).toBe('Something broke');
  });

  it('returns undefined for an unrecognized value', () => {
    expect(getErrorMessage(12345)).toBeUndefined();
  });
});
