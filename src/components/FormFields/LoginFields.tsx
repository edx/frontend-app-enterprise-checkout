import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { Form } from '@openedx/paragon';

import { FieldContainer } from '@/components/FieldContainer';
import Field from '@/components/FormFields/Field';
import { useCheckoutFormStore } from '@/hooks/index';

import type { UseFormReturn } from 'react-hook-form';

interface LoginFieldsProps {
  form: UseFormReturn<LoginData>;
}

const LoginFields = ({ form }: LoginFieldsProps) => {
  const intl = useIntl();
  const planDetailsFormData = useCheckoutFormStore((state) => state.formData.PlanDetails);
  
  // Get email from plan details data (placeholder for now, until the plan details form has an email field)
  // TODO: Update this when the plan details form is properly implemented with email field
  const existingEmail = 'user@example.com'; // planDetailsFormData?.email || '';

  return (
    <FieldContainer>
      <div>
        <h3>
          <FormattedMessage
            id="checkout.loginFields.title"
            defaultMessage="Looks like you already have an account with this email"
            description="Title for the login account section"
          />
        </h3>
        <h3 className="font-weight-light">
          <FormattedMessage
            id="checkout.loginFields.description"
            defaultMessage="Please sign in or go back and use a different email."
            description="Description text explaining the login account purpose"
          />
        </h3>
      </div>
      
      <Form.Group>
        <Form.Label>
          {intl.formatMessage({
            id: 'checkout.loginFields.email.label',
            defaultMessage: 'Email',
            description: 'Label for the email field on the login form',
          })}
        </Form.Label>
        <Field
          name="email"
          form={form}
          type="email"
          defaultValue={existingEmail}
          disabled
          className="mb-3"
        />
      </Form.Group>

      <Form.Group>
        <Form.Label>
          {intl.formatMessage({
            id: 'checkout.loginFields.password.label',
            defaultMessage: 'Password',
            description: 'Label for the password field on the login form',
          })}
        </Form.Label>
        <Field
          name="password"
          form={form}
          type="password"
          manageState={false}
          className="mb-3"
        />
      </Form.Group>
    </FieldContainer>
  );
};

export default LoginFields;
