import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { Stack } from '@openedx/paragon';

import { FieldContainer } from '@/components/FieldContainer';
import Field from '@/components/FormFields/Field';
import { DataStoreKey } from '@/constants/checkout';
import { useCheckoutFormStore } from '@/hooks/index';

import type { UseFormReturn } from 'react-hook-form';

interface LoginFieldsProps {
  form: UseFormReturn<PlanDetailsData>;
}

const LoginFields = ({ form }: LoginFieldsProps) => {
  const intl = useIntl();
  const planDetailsData = useCheckoutFormStore((state) => state.formData[DataStoreKey.PlanDetails]);
  const adminEmail = planDetailsData?.adminEmail;

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
      <Stack gap={1}>
        <Field
          form={form}
          name="adminEmail"
          type="email"
          value={adminEmail || ''}
          disabled={!!adminEmail}
          readOnly={!!adminEmail}
          manageState={false}
          floatingLabel={intl.formatMessage({
            id: 'checkout.loginFields.email.floatingLabel',
            defaultMessage: 'Email',
            description: 'Floating label for the email input field',
          })}
          placeholder={intl.formatMessage({
            id: 'checkout.loginFields.email.placeholder',
            defaultMessage: 'Enter your email',
            description: 'Placeholder for the email input field',
          })}
          controlClassName="mr-0 mt-3"
          registerOptions={{
            required: intl.formatMessage({
              id: 'checkout.loginFields.email.required',
              defaultMessage: 'Email is required',
              description: 'Error message for required email field',
            }),
          }}
        />
        <Field
          form={form}
          name="password"
          type="password"
          manageState={false}
          floatingLabel={intl.formatMessage({
            id: 'checkout.loginFields.password.floatingLabel',
            defaultMessage: 'Password',
            description: 'Floating label for the password input field',
          })}
          placeholder={intl.formatMessage({
            id: 'checkout.loginFields.password.placeholder',
            defaultMessage: 'Enter your password',
            description: 'Placeholder for the password input field',
          })}
          controlClassName="mr-0 mt-3"
          registerOptions={{
            required: intl.formatMessage({
              id: 'checkout.loginFields.password.required',
              defaultMessage: 'Password is required',
              description: 'Error message for required password field',
            }),
          }}
        />
      </Stack>
    </FieldContainer>
  );
};

export default LoginFields;
