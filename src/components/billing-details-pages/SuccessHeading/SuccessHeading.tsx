import { FormattedMessage } from '@edx/frontend-platform/i18n';

const SuccessHeading = () => (
  <p className="h4 font-weight-light text-center">
    <FormattedMessage
      id="checkout.success.default.description"
      defaultMessage="Welcome to edX for Teams! Go to your administrator dashboard to onboard and invite your team members to start learning."
      description="Description text explaining the success account setup status"
    />
  </p>
);

export default SuccessHeading;
