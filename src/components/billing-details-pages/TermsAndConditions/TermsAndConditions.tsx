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
      <p className="fs-4 font-weight-light">
        <FormattedMessage
          id="checkout.termsAndConditionsCheckboxes.description"
          defaultMessage={
            'By subscribing, you and your organization agree to the {descriptionsAndTerms} and {termsAndConditions}'
            + ' linked below.'
          }
          description="Description text explaining the terms and conditions field purpose"
          values={{
            descriptionsAndTerms: (
              <a
                href="https://business.edx.org/product-descriptions-and-terms/"
                target="_blank"
                rel="noopener noreferrer"
              >
                edX Enterprise Product Descriptions and Terms
              </a>
            ),
            termsAndConditions: (
              <a href="https://business.edx.org/enterprise-sales-terms/" target="_blank" rel="noopener noreferrer">
                edX Enterprise Sales Terms and Conditions
              </a>
            ),
          }}
        />
      </p>
    </div>
    <TermsAndConditionsCheckboxes form={form} />
  </FieldContainer>
);

export default TermsAndConditions;
