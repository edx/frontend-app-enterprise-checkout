import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { Container, Image, Stack } from '@openedx/paragon';

import { usePolledAuthenticatedUser, usePolledCheckoutIntent } from '@/components/app/data';

import Celebration from './images/celebration.svg';

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

const InactiveUserHeading = () => (
  <p className="fs-4 font-weight-light text-center">
    <FormattedMessage
      id="checkout.success.inactive.description"
      defaultMessage="Welcome to edX for Teams! Please check your email to complete the account confirmation process."
      description="Description text explaining that user needs to verify their email"
    />
  </p>
);

const PendingHeading = () => (
  <p className="fs-4 font-weight-light text-center">
    <FormattedMessage
      id="checkout.success.pending.description"
      defaultMessage="Welcome to edX for Teams! Your account is currently being configured. We'll send you an email once everything is ready and you can begin onboarding and inviting your team members to start learning."
      description="Description text explaining the pending account setup status"
    />
  </p>
);

const SuccessHeading = () => (
  <p className="fs-4 font-weight-light text-center">
    <FormattedMessage
      id="checkout.success.default.description"
      defaultMessage="Welcome to edX for Teams! Go to your administrator dashboard to onboard and invite your team members to start learning."
      description="Description text explaining the success account setup status"
    />
  </p>
);

const determineBannerMessageElement = (
  checkoutIntentState?: string | null,
  isUserActive?: boolean,
) => {
  if (!checkoutIntentState) { return null; }

  // If user is inactive, show the email verification message regardless of checkout state
  if (!isUserActive) {
    return <InactiveUserHeading />;
  }

  if (checkoutIntentState === 'paid') {
    return <PendingHeading />;
  }

  if (checkoutIntentState === 'fulfilled') {
    return <SuccessHeading />;
  }

  return <ErrorHeading />;
};

const BillingDetailsHeadingMessage = () => {
  const { polledCheckoutIntent } = usePolledCheckoutIntent();
  const { polledAuthenticatedUser } = usePolledAuthenticatedUser();

  const bannerMessageElement = determineBannerMessageElement(
    polledCheckoutIntent?.state,
    polledAuthenticatedUser?.isActive,
  );

  return (
    <>
      <Stack gap={3}>
        <Container className="container-fluid text-center">
          <Image
            src={Celebration}
            fluid
            alt="Celebration of subscription purchase success"
          />
        </Container>
      </Stack>
      {bannerMessageElement}
    </>
  );
};

export default BillingDetailsHeadingMessage;
