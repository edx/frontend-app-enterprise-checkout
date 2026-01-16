import { getConfig } from '@edx/frontend-platform/config';
import { defineMessages, useIntl } from '@edx/frontend-platform/i18n';
import { Button, Image } from '@openedx/paragon';
import { MessageDescriptor } from 'react-intl';
import { useRouteError } from 'react-router';
import { isRouteErrorResponse } from 'react-router-dom';

import { Footer } from '../Footer';
import { Header } from '../Header';

import ErrorIllustration from './images/ErrorIllustration.svg';

interface ErrorPageProps {
  message?: string;
}

interface ErrorPageContentProps {
  message?: string;
  stackTrace?: string;
}

interface UnknownError {
  stack?: string;
}

const errorPageMessages: Record<string, MessageDescriptor> = defineMessages({
  errorHeader: {
    id: 'errorPage.header',
    defaultMessage: "We're sorry, something went wrong",
    description: 'Header text for the error page.',
  },
  errorSubtitle: {
    id: 'errorPage.subtitle',
    defaultMessage: 'Please try again. If the problem persists, please contact your systems administrator.',
    description: 'Subtitle text and CTA for the error page.',
  },
  errorButton: {
    id: 'errorPage.buttonText',
    defaultMessage: 'Return to edX Enterprise Plans',
    description: 'Button text to return to Enterprise Plan page.',
  },
});

function getErrorMessage(err: unknown): string | undefined {
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

const ErrorPageContent = ({ message, stackTrace }: ErrorPageContentProps) => {
  const intl = useIntl();
  const { COMPARE_ENTERPRISE_PLANS_URL } = getConfig();

  return (
    <div className="centered-body container-mw-lg container-fluid">
      <Image className="mb-3" src={ErrorIllustration} fluid alt="Something went wrong error page image" />
      <h2>{intl.formatMessage(errorPageMessages.errorHeader)}</h2>
      {message && (<pre>{message}</pre>)}
      {stackTrace && (<pre>{stackTrace}</pre>)}
      <p>{intl.formatMessage(errorPageMessages.errorSubtitle)}</p>
      <Button className="bg-warning-500 border-warning-500 text-primary-900" href={COMPARE_ENTERPRISE_PLANS_URL}>
        {intl.formatMessage(errorPageMessages.errorButton)}
      </Button>
    </div>
  );
};

const getRouteErrorDerivedMessage = (routeError: UnknownError): string | undefined => {
  try {
    return routeError ? getErrorMessage(routeError) : undefined;
  } catch {
    return undefined;
  }
};

const ErrorPage = ({ message }: ErrorPageProps) => {
  const routeError = useRouteError() as UnknownError;
  const derivedErrorMessage = getRouteErrorDerivedMessage(routeError);

  // Prefer downstream thrown error message; fall back to prop message
  const errorMessage = derivedErrorMessage ?? message;
  return (
    <>
      <Header />
      <ErrorPageContent message={errorMessage} stackTrace={routeError?.stack} />
      <Footer />
    </>
  );
};

export default ErrorPage;
