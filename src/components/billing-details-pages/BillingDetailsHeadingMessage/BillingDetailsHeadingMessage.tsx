import { Container, Image, Stack } from '@openedx/paragon';
import { ReactNode } from 'react';

import Celebration from './images/celebration.svg';

const BillingDetailsHeadingMessage = ({ children }: { children: ReactNode }) => (
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
    {children}
  </>
);

export default BillingDetailsHeadingMessage;
