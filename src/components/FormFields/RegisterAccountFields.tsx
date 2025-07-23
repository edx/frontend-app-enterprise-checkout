import { FormattedMessage } from '@edx/frontend-platform/i18n';

import FieldWrapper from '@/components/FieldWrapper/FieldWrapper';

import type { UseFormReturn } from 'react-hook-form';

interface RegisterAccountFieldsProps {
  form: UseFormReturn<PlanDetailsData>;
}

// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const RegisterAccountFields = ({ form }: RegisterAccountFieldsProps) => (
  <FieldWrapper>
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
  </FieldWrapper>
);

export default RegisterAccountFields;
