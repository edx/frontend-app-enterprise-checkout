import { getConfig } from '@edx/frontend-platform/config';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import { FieldContainer } from '@/components/FieldContainer';
import TermsAndConditionsCheckboxes from '@/components/FormFields/TermsAndConditionsCheckboxes';

import type { UseFormReturn } from 'react-hook-form';

jest.mock('@edx/frontend-platform/config', () => ({
  getConfig: jest.fn().mockReturnValue({
    TERMS_OF_SERVICE_URL: 'https://example.com/terms',
    PRIVACY_POLICY_URL: 'https://example.com/privacy',
  }),
}));

interface TermsAndConditionsProps {
  form: UseFormReturn<BillingDetailsData>;
}

const TermsAndConditions = ({ form }: TermsAndConditionsProps) => {
  const { ENTERPRISE_PRODUCT_DESCRIPTIONS_AND_TERMS_URL, ENTERPRISE_SALES_TERMS_AND_CONDITIONS_URL } = getConfig();

  return (
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
                  href={ENTERPRISE_PRODUCT_DESCRIPTIONS_AND_TERMS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  edX Enterprise Product Descriptions and Terms
                </a>
              ),
              termsAndConditions: (
                <a href={ENTERPRISE_SALES_TERMS_AND_CONDITIONS_URL} target="_blank" rel="noopener noreferrer">
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
};

export default TermsAndConditions;
