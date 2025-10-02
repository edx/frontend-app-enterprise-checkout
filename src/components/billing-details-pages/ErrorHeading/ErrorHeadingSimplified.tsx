import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { Alert } from '@openedx/paragon';
import { Error as ErrorIcon } from '@openedx/paragon/icons';

const ErrorHeadingSimplified = () => (
  <Alert variant="info" icon={ErrorIcon}>
    <Alert.Heading>
      <FormattedMessage
        id="checkout.errorHeading.title"
        defaultMessage="Provisioning is taking longer than expected"
        description="Title for alert when provisioning delays occur"
      />
    </Alert.Heading>
    <p>
      <FormattedMessage
        id="checkout.errorHeading.description"
        defaultMessage="We're still working on creating your account portal. This may take a little longer than usual. If the issue continues, please {contactLink} for assistance."
        description="Description text explaining a provisioning delay and suggesting next steps"
        values={{
          contactLink: (
            <a href="https://google.com" target="_blank" rel="noopener noreferrer">
              <FormattedMessage
                id="checkout.errorHeading.contactSupport"
                defaultMessage="contact our support team"
                description="Link text for contacting support"
              />
            </a>
          ),
        }}
      />
    </p>
  </Alert>
);

export default ErrorHeadingSimplified;
