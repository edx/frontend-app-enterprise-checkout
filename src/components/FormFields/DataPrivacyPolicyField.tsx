import { FormattedMessage } from '@edx/frontend-platform/i18n';

import FieldWrapper from '@/components/FieldWrapper/FieldWrapper';

const DataPrivacyPolicyField = () => (
  <FieldWrapper>
    <div>
      <h3>
        <FormattedMessage
          id="checkout.dataPrivacyPolicyField.title"
          defaultMessage="Data Privacy Policy and Master Service Agreement"
          description="Title for the data privacy field section"
        />
      </h3>
      <h3 className="font-weight-light">
        <FormattedMessage
          id="checkout.dataPrivacyPolicyField.description"
          defaultMessage='By clicking "Purchase now", you agree to edX for Enterprise Data
          Privacy Policy and Master Service Agreement and authorize the recurring charge.'
          description="Description text explaining the data privacy field purpose"
        />
      </h3>
    </div>
  </FieldWrapper>
);

export default DataPrivacyPolicyField;
