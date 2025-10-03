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
        defaultMessage="Welcome to edX for Teams! We're working on building your administrator dashboard. If it doesn't load in a few seconds, {link} for assistance. "
        description="Description text explaining the data privacy field purpose"
        values={{
          link: (
            // TODO: Add URL to contact ECS
            <a href="https://google.com" target="_blank" rel="noopener noreferrer">
              reach out to us
            </a>
          ),
        }}
      />
    </h3>
  </Stack>
);

export default SuccessHeading;
