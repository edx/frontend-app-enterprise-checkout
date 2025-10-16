import { FormattedMessage } from '@edx/frontend-platform/i18n';

const PendingHeading = () => (
  <p className="fs-4 font-weight-light text-center">
    <FormattedMessage
      id="checkout.success.pending.description"
      defaultMessage="Welcome to edX for Teams! Your account is currently being configured. We'll send you an email once everything is ready and you can begin onboarding and inviting your team members to start learning."
      description="Description text explaining the pending account setup status"
    />
  </p>
);

export default PendingHeading;
