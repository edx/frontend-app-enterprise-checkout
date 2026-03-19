import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';
import { Stack } from '@openedx/paragon';
import { useContext } from 'react';
import { type UseFormReturn } from 'react-hook-form';

import useBFFContext from '@/components/app/data/hooks/useBFFContext';
import { FieldContainer } from '@/components/FieldContainer';
import Field from '@/components/FormFields/Field';
import { CHECKOUT_STEPS, PLAN_TYPE, TRACKED_FIELDS } from '@/constants/tracking';
import { useFieldTracking } from '@/hooks/useFieldTracking';

interface CompanyNameFieldProps {
  form: UseFormReturn<AccountDetailsData>
}

const CompanyNameField = ({ form }: CompanyNameFieldProps) => {
  const intl = useIntl();
  const { authenticatedUser }: AppContextValue = useContext(AppContext);
  const { data: bffContext } = useBFFContext(authenticatedUser?.userId || null);
  const checkoutIntentId = bffContext?.checkoutIntent?.id || null;

  const handleCompanyNameBlur = useFieldTracking({
    fieldName: TRACKED_FIELDS.COMPANY_NAME,
    step: CHECKOUT_STEPS.ACCOUNT_DETAILS,
    checkoutIntentId,
    additionalProperties: {
      plan_type: PLAN_TYPE.TEAMS,
    },
  });

  return (
    <FieldContainer>
      <Stack gap={3}>
        <h3>
          <FormattedMessage
            id="checkout.organizationName.title"
            defaultMessage="What is the name of your company or organization?"
            description="Title for the organization name field section"
          />
        </h3>
        <Field
          form={form}
          name="companyName"
          type="text"
          floatingLabel={intl.formatMessage({
            id: 'checkout.nameAndEmailFields.companyName.floatingLabel',
            defaultMessage: 'Company Name',
            description: 'Floating label for the company name input field',
          })}
          placeholder={intl.formatMessage({
            id: 'checkout.nameAndEmailFields.companyName.placeholder',
            defaultMessage: 'Enter your company name',
            description: 'Placeholder for the company name input field',
          })}
          controlClassName="mr-0 mt-3"
          onBlur={handleCompanyNameBlur}
        />
      </Stack>
    </FieldContainer>
  );
};

export default CompanyNameField;
