import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { Container, Image, Stack } from '@openedx/paragon';

import Celebration from './images/celebration.svg';

const SuccessHeading = () => (
  <Stack gap={3}>
    <Container className="container-fluid text-center">
      <Image
        src={Celebration}
        fluid
        alt="Celebration of subscription purchase success"
      />
    </Container>
    <h3 className="font-weight-light text-center">
      <FormattedMessage
        id="checkout.success.description"
        defaultMessage="Welcome to edX for teams! Go to your administrator dashboard to onboard and invite your team members to start learning."
        description="Description text explaining the data privacy field purpose"
      />
    </h3>
  </Stack>
);

export default SuccessHeading;
