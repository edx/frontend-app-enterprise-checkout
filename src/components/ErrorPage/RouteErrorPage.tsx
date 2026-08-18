import { useRouteError } from 'react-router';
import { isRouteErrorResponse } from 'react-router-dom';

import ErrorPage from './ErrorPage';

interface UnknownError {
  stack?: string;
}

interface RouteErrorPageProps {
  message?: string;
}

export function getErrorMessage(err: unknown): string | undefined {
  // Loader/action threw `throw new Response("msg", { status })`
  if (isRouteErrorResponse(err)) {
    if (typeof err.data === 'string') {
      return err.data;
    }
    // Sometimes people throw JSON: new Response(JSON.stringify(...))
    if (err.data && typeof err.data === 'object' && 'message' in err.data) {
      const maybeMsg = (err.data as Record<string, unknown>).message;
      if (typeof maybeMsg === 'string') {
        return maybeMsg;
      }
    }
    // fallback: at least show status text
    return `${err.status} ${err.statusText}`.trim();
  }

  // Loader/action threw `throw new Error("msg")`
  if (err instanceof Error) {
    return err.message;
  }

  // Any other thrown value (string, etc.)
  if (typeof err === 'string') {
    return err;
  }

  return undefined;
}

const getRouteErrorDerivedMessage = (routeError: UnknownError): string | undefined => {
  try {
    return routeError ? getErrorMessage(routeError) : undefined;
  } catch {
    return undefined;
  }
};

/**
 * Thin adapter for React Router data-router error boundaries. `useRouteError` requires
 * data-router context (a route rendered via `RouterProvider` as part of error handling), so
 * this must only be used as a route's `errorElement`, never rendered standalone.
 */
const RouteErrorPage = ({ message }: RouteErrorPageProps) => {
  const routeError = useRouteError() as UnknownError;
  const derivedErrorMessage = getRouteErrorDerivedMessage(routeError);

  // Prefer downstream thrown error message; fall back to prop message
  const errorMessage = derivedErrorMessage ?? message;

  return <ErrorPage message={errorMessage} stackTrace={routeError?.stack} />;
};

export default RouteErrorPage;
