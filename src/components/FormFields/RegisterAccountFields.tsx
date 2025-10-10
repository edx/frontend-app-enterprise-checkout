import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';

import { FieldContainer } from '@/components/FieldContainer';
import Field from '@/components/FormFields/Field';

import type { UseFormReturn } from 'react-hook-form';

interface RegisterAccountFieldsProps {
  form: UseFormReturn<PlanDetailsData>;
}

const RegisterAccountFields = ({ form }: RegisterAccountFieldsProps) => {
  const intl = useIntl();
  return (
    <FieldContainer>
      <div>
        <h3>
          <FormattedMessage
            id="checkout.registerAccountField.title"
            defaultMessage="Register your edX account to start the trial"
            description="Title for the register account section"
          />
        </h3>
        <h3 className="font-weight-light">
          <FormattedMessage
            id="checkout.registerAccountField.description"
            defaultMessage="Your edX learner account will be granted administrator
           access to manage your organization's subscription when the trial starts."
            description="Description text explaining the register account purpose"
          />
        </h3>
      </div>
      <Field
        form={form}
        name="adminEmail"
        type="email"
        floatingLabel={intl.formatMessage({
          id: 'checkout.registerAccountFields.adminEmail.floatingLabel',
          defaultMessage: 'Work email',
          description: 'Floating label for the admin email input field',
        })}
      />

    </FieldContainer>
  );
};

export default RegisterAccountFields;
