import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';

import { FieldContainer } from '@/components/FieldContainer';
import Field from '@/components/FormFields/Field';

import type { UseFormReturn } from 'react-hook-form';

interface CustomUrlFieldProps {
  form: UseFormReturn<AccountDetailsData>
}

const CustomUrlField = ({ form }: CustomUrlFieldProps) => {
  const intl = useIntl();
  return (
    <FieldContainer>
      <div>
        <h3>
          <FormattedMessage
            id="checkout.customUrlField.title"
            defaultMessage="Create a custom URL for your team"
            description="Title for the custom url field section"
          />
        </h3>
        <p className="fs-4 font-weight-light">
          <FormattedMessage
            id="checkout.customUrl.description"
            defaultMessage="This is how your colleagues will access your team subscription on edX.
           This access link name cannot be changed after your trial subscription starts."
            description="Description text explaining the custom url field purpose"
          />
        </p>
        <span className="d-flex align-items-center mt-3">
          https://enterprise.edx.org/
          <Field
            name="enterpriseSlug"
            type="text"
            form={form}
            placeholder={intl.formatMessage({
              id: 'checkout.customUrlField.enterpriseSlug.floatingLabel',
              defaultMessage: 'URL name',
              description: 'Floating label for the custom url input field',
            })}
            controlClassName="ml-1.5"
            className="flex-grow-1 m-0 pt-2"
          />
        </span>
      </div>
    </FieldContainer>
  );
};

export default CustomUrlField;
