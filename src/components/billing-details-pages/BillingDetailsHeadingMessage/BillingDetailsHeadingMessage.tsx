import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { Container, Image, Stack } from '@openedx/paragon';

import { usePolledAuthenticatedUser, usePolledCheckoutIntent } from '@/components/app/data';
import { isEssentialsFlow } from '@/components/app/routes/loaders/utils';

import Celebration from './images/celebration.svg';

const ErrorHeading = () => {
  const isEssentials = isEssentialsFlow();
  return (
    <>
      <h2 className="text-center font-weight-normal mb-0">
        Account Setup is Taking Longer Than Expected
      </h2>
      <p className="h4 font-weight-light text-center">
        <FormattedMessage
          id="checkout.success.error.description"
          defaultMessage="We're experiencing a brief delay in setting up your {productName} account. We'll send you a confirmation email immediately once your account is fully operational. Thank you for your patience!"
          description="Description text explaining the error account setup status"
          values={{
            productName: isEssentials ? 'edX Essentials' : 'edX Team',
          }}
        />
      </p>
    </>
  );
};

const InactiveUserHeading = () => {
  const isEssentials = isEssentialsFlow();
  return (
    <p className="fs-4 font-weight-light text-center">
      <FormattedMessage
        id="checkout.success.inactive.description"
        defaultMessage="Welcome to {productName}! Please check your email to complete the account confirmation process."
        description="Description text explaining that user needs to verify their email"
        values={{
          productName: isEssentials ? 'edX for Essentials' : 'edX for Team',
        }}
      />
    </p>
  );
};

const PendingHeading = () => {
  const isEssentials = isEssentialsFlow();
  return (
    <p className="fs-4 font-weight-light text-center">
      <FormattedMessage
        id="checkout.success.pending.description"
        defaultMessage="Welcome to {productName}! Your account is currently being configured. We'll send you an email once everything is ready and you can begin onboarding and inviting your team members to start learning."
        description="Description text explaining the pending account setup status"
        values={{
          productName: isEssentials ? 'edX for Essentials' : 'edX for Team',
        }}
      />
    </p>
  );
};

const SuccessHeading = () => {
  const isEssentials = isEssentialsFlow();
  return (
    <p className="fs-4 font-weight-light text-center">
      <FormattedMessage
        id="checkout.success.default.description"
        defaultMessage="Welcome to {productName}! Go to your administrator dashboard to onboard and invite your team members to start learning."
        description="Description text explaining the success account setup status"
        values={{
          productName: isEssentials ? 'edX for Essentials' : 'edX for Team',
        }}
      />
    </p>
  );
};

const determineBannerMessageElement = (
  checkoutIntentState?: string | null,
  isUserActive?: boolean,
) => {
  if (!checkoutIntentState) { return null; }

  // If user is inactive, show the email verification message regardless of checkout state
  if (!isUserActive) {
    return <InactiveUserHeading />;
  }

  // Show success message for fulfilled state
  if (checkoutIntentState === 'fulfilled') {
    return <SuccessHeading />;
  }

  // Show pending message for paid or created states (account setup in progress)
  if (checkoutIntentState === 'paid' || checkoutIntentState === 'created') {
    return <PendingHeading />;
  }

  // Show error message for any error states
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
