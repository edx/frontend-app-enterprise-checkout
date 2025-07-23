import { FormattedMessage } from '@edx/frontend-platform/i18n';

import FieldWrapper from '@/components/FieldWrapper/FieldWrapper';

// eslint-disable-next-line react/prop-types
const AuthenticatedUserField = ({ fullName, orgEmail }) => (
  <FieldWrapper>
    <div>
      <h3>
        <FormattedMessage
          id="checkout.authenticatedUserField.title"
          defaultMessage="Account details"
          description="Title for the authenticated user field section"
        />
      </h3>
      <h3 className="font-weight-light">
        <FormattedMessage
          id="checkout.authenticatedUserField.description"
          defaultMessage="Signed in as: "
          description="Description text explaining the licenses field purpose"
        />
        <span className="font-weight-bold">
          {fullName}&nbsp;({orgEmail})
        </span>
      </h3>
    </div>
  </FieldWrapper>
);

export default AuthenticatedUserField;
