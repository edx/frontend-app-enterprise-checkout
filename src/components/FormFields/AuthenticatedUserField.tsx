import { FormattedMessage } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';

import { FieldContainer } from '@/components/FieldContainer';

interface AuthenticatedUserFieldProps {
  fullName: string;
  email: string;
}

const AuthenticatedUserField: React.FC<AuthenticatedUserFieldProps> = ({ fullName, email }) => (
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
          {fullName}&nbsp;({email})
        </span>
      </h3>
    </div>
  </FieldContainer>
);

AuthenticatedUserField.propTypes = {
  fullName: PropTypes.string.isRequired,
  email: PropTypes.string.isRequired,
};

export default AuthenticatedUserField;
