import { getConfig } from '@edx/frontend-platform/config';
import { defineMessages, useIntl } from '@edx/frontend-platform/i18n';
import { Button, Image } from '@openedx/paragon';
import { MessageDescriptor } from 'react-intl';

import { Footer } from '../Footer';
import { Header } from '../Header';

import ErrorIllustration from './images/ErrorIllustration.svg';

interface ErrorPageProps {
  message?: string;
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
});

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

const ErrorPage = ({ message, stackTrace }: ErrorPageProps) => (
  <>
    <Header />
    <ErrorPageContent message={message} stackTrace={stackTrace} />
    <Footer />
  </>
);

export default ErrorPage;
