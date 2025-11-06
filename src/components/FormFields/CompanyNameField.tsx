import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { Stack } from '@openedx/paragon';
import { type UseFormReturn } from 'react-hook-form';

import { FieldContainer } from '@/components/FieldContainer';
import Field from '@/components/FormFields/Field';

interface CompanyNameFieldProps {
  form: UseFormReturn<AccountDetailsData>
}

const CompanyNameField = ({ form }: CompanyNameFieldProps) => {
  const intl = useIntl();
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
        />
      </Stack>
    </FieldContainer>
  );
};

export default CompanyNameField;
