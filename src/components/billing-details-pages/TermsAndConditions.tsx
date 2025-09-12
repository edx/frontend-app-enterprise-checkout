import { FormattedMessage } from '@edx/frontend-platform/i18n';

import { FieldContainer } from '@/components/FieldContainer';
import TermsAndConditionsCheckboxes from '@/components/FormFields/TermsAndConditionsCheckboxes';

import type { UseFormReturn } from 'react-hook-form';

interface TermsAndConditionsProps {
  form: UseFormReturn<BillingDetailsData>;
}

const TermsAndConditions = ({ form }: TermsAndConditionsProps) => (
  <FieldContainer>
    <div>
      <h3>
        <FormattedMessage
          id="checkout.termsAndConditionsCheckboxes.title"
          defaultMessage="edX Enterprise Terms"
          description="Title for the terms and conditions field section"
        />
      </h3>
      <h4 className="font-weight-light">
        <FormattedMessage
          id="checkout.termsAndConditionsCheckboxes.description"
          defaultMessage="By subscribing, you and your organization agree to the edX
          Enterprise Product Descriptions and Terms and edX Enterprise Sales Terms and Conditions linked below."
          description="Description text explaining the terms and conditions field purpose"
        />
      </h4>
    </div>
    <TermsAndConditionsCheckboxes form={form} />
  </FieldContainer>
);

export default TermsAndConditions;
