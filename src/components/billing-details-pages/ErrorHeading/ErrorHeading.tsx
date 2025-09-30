import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { Alert } from '@openedx/paragon';
import { Error as ErrorIcon } from '@openedx/paragon/icons';

const ErrorHeading = () => (
  <Alert variant="danger" icon={ErrorIcon}>
    <Alert.Heading>
      <FormattedMessage
        id="checkout.errorHeading.title"
        defaultMessage="We're sorry, something went wrong"
        description="Title for error alert when something goes wrong during checkout"
      />
    </Alert.Heading>
    <p>
      <FormattedMessage
        id="checkout.errorHeading.description"
        defaultMessage="An unexpected error occurred while setting up your account. We're actively working to resolve this issue and will notify you as soon as your account is configured and ready to use. We apologize for the inconvenience. If you require immediate assistance, please {contactLink}."
        description="Description text explaining the error and providing next steps"
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

export default ErrorHeading;
