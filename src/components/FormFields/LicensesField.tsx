import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';

import { FieldContainer } from '@/components/FieldContainer';

import Field from './Field';

import type { UseFormReturn } from 'react-hook-form';

interface LicensesFieldProps {
  form: UseFormReturn<PlanDetailsData>;
}

const LicensesField = ({ form }: LicensesFieldProps) => {
  const intl = useIntl();
  return (
    <FieldContainer>
      <div>
        <h3>
          <FormattedMessage
            id="checkout.licensesField.title"
            defaultMessage="Number of licenses"
            description="Title for the licenses field section"
          />
        </h3>
        <h3 className="font-weight-light">
          <FormattedMessage
            id="checkout.licensesField.description"
            defaultMessage="Enter in the number of licenses you want to purchase. As an administrator, you can issue and swap licenses between employees."
            description="Description text explaining the licenses field purpose"
          />
        </h3>
      </div>
      <Field
        form={form}
        name="quantity"
        type="number"
        floatingLabel={intl.formatMessage({
          id: 'checkout.licensesField.floatingLabel',
          defaultMessage: 'Number of licenses',
          description: 'Floating label for the number of licenses input field',
        })}
        placeholder={intl.formatMessage({
          id: 'checkout.licensesField.placeholder',
          defaultMessage: 'eg. 10',
          description: 'Placeholder example for the number of licenses input field',
        })}
        min="0"
        className="mr-0 mt-3"
      />
    </FieldContainer>
  );
};

export default LicensesField;
