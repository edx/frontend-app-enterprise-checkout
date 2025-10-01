import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { Alert, Icon } from '@openedx/paragon';
import { Error } from '@openedx/paragon/icons';

const AccountProvisioningError = () => (
  <Alert variant="danger">
    <div className="d-flex align-items-start">
      <div className="flex-shrink-0 pr-2">
        <Icon src={Error} className="text-danger" />
      </div>
      <div className="flex-grow-1 ms-3">
        <Alert.Heading>
          <FormattedMessage
            id="checkout.accountProvisioningError.title"
            defaultMessage="We're sorry, something went wrong"
            description="Title for the account provisioning error alert"
          />
        </Alert.Heading>
        <FormattedMessage
          id="checkout.accountProvisioningError.message"
          defaultMessage="An unexpected error occurred while setting up your account. We're actively working to resolve this issue and will notify you as soon as your account is configured and ready to use. We apologize for the inconvenience. If you require immediate assistance, please contact our support team."
          description="Error message displayed when account provisioning fails"
        />
      </div>
    </div>
  </Alert>
);

export default AccountProvisioningError;
