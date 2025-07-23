import { FormattedMessage } from '@edx/frontend-platform/i18n';

import FieldContainer from '@/components/FieldWrapper/FieldContainer';

const CustomUrlField = () => (
  <FieldContainer>
    <div>
      <h3>
        <FormattedMessage
          id="checkout.customUrlField.title"
          defaultMessage="Create a custom URL for your team"
          description="Title for the custom url field section"
        />
      </h3>
      <h3 className="font-weight-light">
        <FormattedMessage
          id="checkout.customUrl.description"
          defaultMessage="This is how your colleagues willa ccess your team subscription on edX.
           This access link name cannot be changed after your trial subscription starts."
          description="Description text explaining the custom url field purpose"
        />
      </h3>
    </div>
  </FieldContainer>
);

export default CustomUrlField;
