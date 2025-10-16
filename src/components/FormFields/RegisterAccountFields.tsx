import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { Stack } from '@openedx/paragon';
import { Lock, Visibility, VisibilityOff } from '@openedx/paragon/icons';
import { useState } from 'react';

import { FieldContainer } from '@/components/FieldContainer';
import Field from '@/components/FormFields/Field';

import type { UseFormReturn } from 'react-hook-form';

interface RegisterAccountFieldsProps {
  form: UseFormReturn<PlanDetailsData>;
}

const RegisterAccountFields = ({ form }: RegisterAccountFieldsProps) => {
  const intl = useIntl();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

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
        <p className="h4 font-weight-light">
          <FormattedMessage
            id="checkout.registerAccountField.description"
            defaultMessage="Your edX learner account will be granted administrator access to manage your organization's subscription when the trial starts."
            description="Description text explaining the register account purpose"
          />
        </p>
      </div>
      <Stack gap={3}>
        <Field
          form={form}
          name="adminEmail"
          type="email"
          floatingLabel={intl.formatMessage({
            id: 'checkout.registerAccountFields.workEmail.floatingLabel',
            defaultMessage: 'Work email',
            description: 'Floating label for the work email input field',
          })}
          placeholder={intl.formatMessage({
            id: 'checkout.registerAccountFields.workEmail.placeholder',
            defaultMessage: 'Enter your work email',
            description: 'Placeholder for the work email input field',
          })}
          controlClassName="mr-0"
          className="bg-light-300"
          readOnly
          rightIcon={<Lock className="text-muted" />}
        />

        <Field
          form={form}
          name="fullName"
          type="text"
          floatingLabel={intl.formatMessage({
            id: 'checkout.registerAccountFields.fullName.floatingLabel',
            defaultMessage: 'Full name',
            description: 'Floating label for the full name input field',
          })}
          placeholder={intl.formatMessage({
            id: 'checkout.registerAccountFields.fullName.placeholder',
            defaultMessage: 'Enter your full name',
            description: 'Placeholder for the full name input field',
          })}
          controlClassName="mr-0"
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
          floatingLabel={intl.formatMessage({
            id: 'checkout.registerAccountFields.username.floatingLabel',
            defaultMessage: 'Public username',
            description: 'Floating label for the username input field',
          })}
          placeholder={intl.formatMessage({
            id: 'checkout.registerAccountFields.username.placeholder',
            defaultMessage: 'Enter your public username',
            description: 'Placeholder for the username input field',
          })}
          controlClassName="mr-0"
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
          type={showPassword ? 'text' : 'password'}
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
          controlClassName="mr-0"
          rightIcon={(
            <button
              type="button"
              className="btn btn-link p-0 border-0"
              onClick={togglePasswordVisibility}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              style={{ background: 'none', cursor: 'pointer' }}
            >
              {showPassword ? <VisibilityOff className="text-muted" /> : <Visibility className="text-muted" />}
            </button>
          )}
          registerOptions={{
            required: intl.formatMessage({
              id: 'checkout.registerAccountFields.password.required',
              defaultMessage: 'Password is required',
              description: 'Error message for required password field',
            }),
            minLength: {
              value: 8,
              message: intl.formatMessage({
                id: 'checkout.registerAccountFields.password.minLength',
                defaultMessage: 'Password must be at least 8 characters',
                description: 'Error message for minimum password length',
              }),
            },
          }}
        />

        <Field
          form={form}
          name="confirmPassword"
          type={showConfirmPassword ? 'text' : 'password'}
          floatingLabel={intl.formatMessage({
            id: 'checkout.registerAccountFields.confirmPassword.floatingLabel',
            defaultMessage: 'Confirm password',
            description: 'Floating label for the confirm password input field',
          })}
          placeholder={intl.formatMessage({
            id: 'checkout.registerAccountFields.confirmPassword.placeholder',
            defaultMessage: 'Confirm your password',
            description: 'Placeholder for the confirm password input field',
          })}
          controlClassName="mr-0"
          rightIcon={(
            <button
              type="button"
              className="btn btn-link p-0 border-0"
              onClick={toggleConfirmPasswordVisibility}
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              style={{ background: 'none', cursor: 'pointer' }}
            >
              {showConfirmPassword ? <VisibilityOff className="text-muted" /> : <Visibility className="text-muted" />}
            </button>
          )}
          registerOptions={{
            required: intl.formatMessage({
              id: 'checkout.registerAccountFields.confirmPassword.required',
              defaultMessage: 'Please confirm your password',
              description: 'Error message for required confirm password field',
            }),
            validate: (value: string) => {
              const password = form.getValues('password');
              return value === password || intl.formatMessage({
                id: 'checkout.registerAccountFields.confirmPassword.match',
                defaultMessage: 'Passwords do not match',
                description: 'Error message when passwords do not match',
              });
            },
          }}
        />

        <Field
          form={form}
          name="country"
          type="select"
          options={[
            {
              value: 'US',
              label: 'United States of America',
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
            defaultMessage: 'Country/Region',
            description: 'Floating label for the country dropdown field',
          })}
          placeholder={intl.formatMessage({
            id: 'checkout.registerAccountFields.country.placeholder',
            defaultMessage: 'Select a country',
            description: 'Placeholder for the country dropdown field',
          })}
          controlClassName="mr-0"
          className="bg-light-300"
          disabled
        />
      </Stack>
    </FieldContainer>
  );
};

export default RegisterAccountFields;
