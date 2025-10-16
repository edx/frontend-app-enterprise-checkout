import { FormattedMessage } from '@edx/frontend-platform/i18n';

const ErrorHeading = () => (
  <>
    <h2 className="text-center font-weight-normal mb-0">
      Account Setup is Taking Longer Than Expected
    </h2>
    <p className="h4 font-weight-light text-center">
      <FormattedMessage
        id="checkout.success.error.description"
        defaultMessage="We're experiencing a brief delay in setting up your edX Teams account. We'll send you a confirmation email immediately once your account is fully operational. Thank you for your patience!"
        description="Description text explaining the error account setup status"
      />
    </p>
  </>
);

export default ErrorHeading;
