import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { Stack } from '@openedx/paragon';

import { FieldContainer } from '@/components/FieldWrapper';

import Field from './Field';

import type { UseFormReturn } from 'react-hook-form';

interface NameAndEmailFieldsProps {
  form: UseFormReturn<PlanDetailsData>;
}

const NameAndEmailFields = ({ form }: NameAndEmailFieldsProps) => {
  const intl = useIntl();
  return (
    <FieldContainer>
      <div>
        <h3>
          <FormattedMessage
            id="checkout.NameAndEmailFields.title"
            defaultMessage="What is your name and email?"
            description="Title for the name and email section"
          />
        </h3>
        <h3 className="font-weight-light">
          <FormattedMessage
            id="checkout.NameAndEmailFields.description"
            defaultMessage="Please use your work email to build your team's subscription trial."
            description="Description text explaining the name and email purpose"
          />
        </h3>
      </div>
      <Stack gap={1}>
        <Field
          form={form}
          name="fullName"
          type="text"
          floatingLabel={intl.formatMessage({
            id: 'checkout.nameAndEmailFields.fullName.floatingLabel',
            defaultMessage: 'Full Name',
            description: 'Floating label for the full name input field',
          })}
          placeholder={intl.formatMessage({
            id: 'checkout.nameAndEmailFields.fullName.placeholder',
            defaultMessage: 'Enter your full name',
            description: 'Placeholder for the full name input field',
          })}
          controlClassName="mr-0 mt-3"
          className="bg-light-300"
        />
        <Field
          form={form}
          name="orgName"
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
        <Field
          form={form}
          name="orgEmail"
          type="email"
          floatingLabel={intl.formatMessage({
            id: 'checkout.nameAndEmailFields.workEmail.floatingLabel',
            defaultMessage: 'Work Email',
            description: 'Floating label for the work email input field',
          })}
          placeholder={intl.formatMessage({
            id: 'checkout.nameAndEmailFields.workEmail.placeholder',
            defaultMessage: 'Enter your work email',
            description: 'Placeholder for the work email input field',
          })}
          controlClassName="mr-0 mt-3"
        />
        <Field
          form={form}
          name="country"
          type="select"
          options={[
            {
              value: 'US',
              label: 'United States',
            },
            {
              value: 'CA',
              label: 'Canada',
            },
            {
              value: 'GB',
              label: 'United Kingdom',
            },
            {
              value: 'AU',
              label: 'Australia',
            },
            {
              value: 'DE',
              label: 'Germany',
            },
            {
              value: 'FR',
              label: 'France',
            },
            {
              value: 'IN',
              label: 'India',
            },
            {
              value: 'JP',
              label: 'Japan',
            },
          ]}
          floatingLabel={intl.formatMessage({
            id: 'checkout.nameAndEmailFields.country.floatingLabel',
            defaultMessage: 'Country of Residence',
            description: 'Floating label for the country of residence dropdown field',
          })}
          placeholder={intl.formatMessage({
            id: 'checkout.nameAndEmailFields.country.placeholder',
            defaultMessage: 'Select a country',
            description: 'Placeholder for the country of residence dropdown field',
          })}
          controlClassName="mr-0 mt-3"
        />
      </Stack>
    </FieldContainer>
  );
};

export default NameAndEmailFields;
