import {
  Alert,
  Container,
  Skeleton,
  Stack,
} from '@openedx/paragon';
import { CheckCircle } from '@openedx/paragon/icons';
import React from 'react';

const CheckoutPage: React.FC = () => (
  <main>
    <Container
      size="lg"
      className="py-5"
      data-testid="container"
    >
      <h1 className="h2 mb-3">
        Congratulations, your subscription is confirmed!
      </h1>
      <Stack gap={4} data-testid="stack">
        <Alert
          variant="success"
          icon={CheckCircle}
          dismissible
          data-testid="alert"
        >
          <Alert.Heading data-testid="alert-heading">
            Enjoy your free trial subscription
          </Alert.Heading>
          <p>Lorem ipsum dolar sit emit.</p>
        </Alert>
        <div>
          <h2 className="h3">
            We&apos;re processing your subscription...
          </h2>
          <p>
            When your subscription is ready, you&apos;ll be redirected
            to your Admin Dashboard to continue setting up your subscription.
          </p>
          <hr />
          <p>
            Note: this could be a page route in a new Checkout MFE, or a new page route
            in the existing Admin Portal MFE.
          </p>
          <p>
            Note: In the background, we could continue to poll (TBD) until the provisioning
            is complete. Once complete/successful, refresh the JWT cookie and update
            the <code>authenticatedUser</code> via <code>@edx/frontend-platform</code>.
            This will ensure the newly provisioned <code>enterprise_admin</code> system-wide
            user role assignment is updated in the JWT cookie without having to sign out and
            sign back in.
          </p>
          <Skeleton height={200} data-testid="skeleton" />
        </div>
      </Stack>
    </Container>
  </main>
);

export default CheckoutPage;
