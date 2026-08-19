import { getConfig } from '@edx/frontend-platform/config';
import { defineMessages, useIntl } from '@edx/frontend-platform/i18n';
import { Button, Image } from '@openedx/paragon';
import { MessageDescriptor } from 'react-intl';

import { Footer } from '../Footer';
import { Header } from '../Header';

import ErrorIllustration from './images/ErrorIllustration.svg';

export type ErrorPageMessageKind = 'errorBoundary' | 'notFound';

const isErrorPageMessageKind = (
  message: string,
): message is ErrorPageMessageKind => ['errorBoundary', 'notFound'].includes(message);

interface ErrorPageProps {
  // A known ErrorPageMessageKind is translated; any other string is displayed verbatim.
  message?: ErrorPageMessageKind | string;
  stackTrace?: string;
}

interface ErrorPageContentProps {
  message?: string;
  stackTrace?: string;
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
  errorIllustrationAlt: {
    id: 'errorPage.illustrationAlt',
    defaultMessage: 'Something went wrong error page image',
    description: 'Alt text for the error page illustration.',
  },
});

const errorPageKindMessages: Record<ErrorPageMessageKind, MessageDescriptor> = defineMessages({
  errorBoundary: {
    id: 'errorPage.boundaryMessage',
    defaultMessage: 'Error Boundary',
    description: 'Fallback message shown when an error boundary catches an unexpected error',
  },
  notFound: {
    id: 'errorPage.notFoundMessage',
    defaultMessage: 'Page Not Found',
    description: 'Fallback message shown when a route does not match any page',
  },
});

const ErrorPageContent = ({ message, stackTrace }: ErrorPageContentProps) => {
  const intl = useIntl();
  const { COMPARE_ENTERPRISE_PLANS_URL } = getConfig();

  return (
    <div className="centered-body container-mw-lg container-fluid">
      <Image className="mb-3" src={ErrorIllustration} fluid alt={intl.formatMessage(errorPageMessages.errorIllustrationAlt)} />
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

const ErrorPage = ({ message, stackTrace }: ErrorPageProps) => {
  const intl = useIntl();
  const resolvedMessage = message && isErrorPageMessageKind(message)
    ? intl.formatMessage(errorPageKindMessages[message])
    : message;

  return (
    <>
      <Header />
      <ErrorPageContent message={resolvedMessage} stackTrace={stackTrace} />
      <Footer />
    </>
  );
};

export default ErrorPage;
