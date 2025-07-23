import { FormattedMessage } from '@edx/frontend-platform/i18n';

import FieldWrapper from '@/components/FieldWrapper/FieldWrapper';

const FreeTrialSuccessField = () => (
  <FieldWrapper>
    <div>
      <h3>
        <FormattedMessage
          id="checkout.freeTrialSuccessField.title"
          defaultMessage="Your free trial for edX team's subscription has started."
          description="Title for the free trial success field section"
        />
      </h3>
    </div>
  </FieldWrapper>
);

export default FreeTrialSuccessField;
