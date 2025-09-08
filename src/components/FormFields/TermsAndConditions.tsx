import { FormattedMessage } from '@edx/frontend-platform/i18n';

import { FieldContainer } from '@/components/FieldContainer';
import TermsAndConditionsCheckboxes from '@/components/FormFields/TermsAndConditionsCheckboxes';

const TermsAndConditions = () => (
  <FieldContainer>
    <div>
      <h3>
        <FormattedMessage
          id="checkout.termsAndConditionsCheckboxes.title"
          defaultMessage="edX Enterprise Terms"
          description="Title for the terms and conditions field section"
        />
      </h3>
      <h3 className="font-weight-light">
        <FormattedMessage
          id="checkout.termsAndConditionsCheckboxes.description"
          defaultMessage="By subscribing, you and your organization agree to the edX
          Enterprise Product Descriptions and Terms and edX Enterprise Sales Terms and Conditions linked below."
          description="Description text explaining the terms and conditions field purpose"
        />
      </h3>
    </div>
    <TermsAndConditionsCheckboxes />
  </FieldContainer>
);

export default TermsAndConditions;
