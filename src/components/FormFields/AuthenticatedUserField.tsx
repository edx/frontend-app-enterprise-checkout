import { FormattedMessage } from '@edx/frontend-platform/i18n';

import { FieldContainer } from '@/components/FieldContainer';

interface AuthenticatedUserFieldProps {
  fullName: string;
  adminEmail: string;
}

const AuthenticatedUserField = ({ fullName, adminEmail }: AuthenticatedUserFieldProps) => (
  <FieldContainer>
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
          {fullName}&nbsp;({adminEmail})
        </span>
      </h3>
    </div>
  </FieldContainer>
);

export default AuthenticatedUserField;
