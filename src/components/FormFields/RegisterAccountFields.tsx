import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { Stack } from '@openedx/paragon';

import { FieldContainer } from '@/components/FieldContainer';
import Field from '@/components/FormFields/Field';
import { DataStoreKey } from '@/constants/checkout';
import { useCheckoutFormStore } from '@/hooks/index';

import type { UseFormReturn } from 'react-hook-form';

interface RegisterAccountFieldsProps {
  form: UseFormReturn<PlanDetailsRegisterPageData>;
}

const RegisterAccountFields = ({ form }: RegisterAccountFieldsProps) => {
  const intl = useIntl();
  const planDetailsData = useCheckoutFormStore((state) => state.formData[DataStoreKey.PlanDetails]);
  const adminEmail = planDetailsData?.adminEmail;

  return (
    <FieldContainer>
      <div className="mb-3">
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
            id: 'checkout.registerAccountFields.email.floatingLabel',
            defaultMessage: 'Work Email',
            description: 'Floating label for the work email input field',
          })}
          placeholder={intl.formatMessage({
            id: 'checkout.registerAccountFields.email.placeholder',
            defaultMessage: 'Enter your work email',
            description: 'Placeholder for the work email input field',
          })}
          controlClassName="mr-0 mt-3"
          registerOptions={{
            required: intl.formatMessage({
              id: 'checkout.registerAccountFields.email.required',
              defaultMessage: 'Work email is required',
              description: 'Error message for required work email field',
            }),
          }}
        />
        <Field
          form={form}
          name="fullName"
          type="text"
          manageState={false}
          floatingLabel={intl.formatMessage({
            id: 'checkout.registerAccountFields.fullName.floatingLabel',
            defaultMessage: 'Full Name',
            description: 'Floating label for the full name input field',
          })}
          placeholder={intl.formatMessage({
            id: 'checkout.registerAccountFields.fullName.placeholder',
            defaultMessage: 'Enter your full name',
            description: 'Placeholder for the full name input field',
          })}
          controlClassName="mr-0 mt-3"
          registerOptions={{
            required: intl.formatMessage({
              id: 'checkout.registerAccountFields.fullName.required',
              defaultMessage: 'Full name is required',
              description: 'Error message for required full name field',
            }),
          }}
        />
        <Field
          form={form}
          name="username"
          type="text"
          manageState={false}
          floatingLabel={intl.formatMessage({
            id: 'checkout.registerAccountFields.username.floatingLabel',
            defaultMessage: 'Public Username',
            description: 'Floating label for the username input field',
          })}
          placeholder={intl.formatMessage({
            id: 'checkout.registerAccountFields.username.placeholder',
            defaultMessage: 'Enter your desired username',
            description: 'Placeholder for the username input field',
          })}
          controlClassName="mr-0 mt-3"
          registerOptions={{
            required: intl.formatMessage({
              id: 'checkout.registerAccountFields.username.required',
              defaultMessage: 'Username is required',
              description: 'Error message for required username field',
            }),
          }}
        />
        <Field
          form={form}
          name="password"
          type="password"
          manageState={false}
          floatingLabel={intl.formatMessage({
            id: 'checkout.registerAccountFields.password.floatingLabel',
            defaultMessage: 'Password',
            description: 'Floating label for the password input field',
          })}
          placeholder={intl.formatMessage({
            id: 'checkout.registerAccountFields.password.placeholder',
            defaultMessage: 'Enter your password',
            description: 'Placeholder for the password input field',
          })}
          controlClassName="mr-0 mt-3"
          registerOptions={{
            required: intl.formatMessage({
              id: 'checkout.registerAccountFields.password.required',
              defaultMessage: 'Password is required',
              description: 'Error message for required password field',
            }),
          }}
        />
        <Field
          form={form}
          name="confirmPassword"
          type="password"
          manageState={false}
          floatingLabel={intl.formatMessage({
            id: 'checkout.registerAccountFields.confirmPassword.floatingLabel',
            defaultMessage: 'Confirm Password',
            description: 'Floating label for the confirm password input field',
          })}
          placeholder={intl.formatMessage({
            id: 'checkout.registerAccountFields.confirmPassword.placeholder',
            defaultMessage: 'Confirm your password',
            description: 'Placeholder for the confirm password input field',
          })}
          controlClassName="mr-0 mt-3"
          registerOptions={{
            required: intl.formatMessage({
              id: 'checkout.registerAccountFields.confirmPassword.required',
              defaultMessage: 'Please confirm your password',
              description: 'Error message for required confirm password field',
            }),
          }}
        />
        <Field
          form={form}
          name="country"
          type="select"
          manageState={false}
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
            id: 'checkout.registerAccountFields.country.floatingLabel',
            defaultMessage: 'Country',
            description: 'Floating label for the country dropdown field',
          })}
          placeholder={intl.formatMessage({
            id: 'checkout.registerAccountFields.country.placeholder',
            defaultMessage: 'Select a country',
            description: 'Placeholder for the country dropdown field',
          })}
          controlClassName="mr-0 mt-3"
          registerOptions={{
            required: intl.formatMessage({
              id: 'checkout.registerAccountFields.country.required',
              defaultMessage: 'Country is required',
              description: 'Error message for required country field',
            }),
          }}
        />
      </Stack>
    </FieldContainer>
  );
};

export default RegisterAccountFields;
