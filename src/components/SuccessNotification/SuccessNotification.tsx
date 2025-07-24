import { FormattedMessage } from '@edx/frontend-platform/i18n';

import { FieldContainer } from '@/components/FieldContainer';

const SuccessNotification = () => (
  <FieldContainer>
    <div>
      <h3>
        <FormattedMessage
          id="checkout.freeTrialSuccessField.title"
          defaultMessage="Your free trial for edX team's subscription has started."
          description="Title for the free trial success field section"
        />
      </h3>
    </div>
  </FieldContainer>
);

export default SuccessNotification;
