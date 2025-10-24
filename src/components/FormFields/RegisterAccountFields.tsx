import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { Stack } from '@openedx/paragon';
import { Lock, Visibility, VisibilityOff } from '@openedx/paragon/icons';
import { useState } from 'react';

import { useCountryOptions, useRecaptchaToken } from '@/components/app/data';
import { FieldContainer } from '@/components/FieldContainer';
import Field from '@/components/FormFields/Field';

import type { UseFormReturn } from 'react-hook-form';

interface RegisterAccountFieldsProps {
  form: UseFormReturn<PlanDetailsRegisterPageData>;
}

// Reusable internal button for toggling password visibility across password fields
type PasswordVisibilityToggleProps = {
  isVisible: boolean;
  onToggle: () => void;
};

const PasswordVisibilityToggle = ({ isVisible, onToggle }: PasswordVisibilityToggleProps) => (
  <button
    type="button"
    className="btn btn-link p-0 border-0"
    onClick={onToggle}
    aria-label={isVisible ? 'Hide password' : 'Show password'}
    style={{ background: 'none', cursor: 'pointer' }}
  >
    {isVisible ? <VisibilityOff className="text-muted" /> : <Visibility className="text-muted" />}
  </button>
);

// Header component for the Register Account section
export const RegisterAccountFieldsHeader = () => (
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
);

// Admin email field (read-only)
export const RegisterAccountAdminEmail = ({ form }: { form: UseFormReturn<PlanDetailsRegisterPageData> }) => {
  const intl = useIntl();
  return (
    <Field
      form={form}
      name="adminEmail"
      type="email"
      value={form.getValues('adminEmail') || ''}
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
  );
};

// Full name field (read-only)
export const RegisterAccountFullName = ({ form }: { form: UseFormReturn<PlanDetailsRegisterPageData> }) => {
  const intl = useIntl();
  return (
    <Field
      form={form}
      name="fullName"
      type="text"
      value={form.getValues('fullName') || ''}
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
      readOnly
    />
  );
};

// Username field (basic field only; suggestions handled elsewhere if needed)
export const RegisterAccountUsername = ({ form }: { form: UseFormReturn<PlanDetailsRegisterPageData> }) => {
  const intl = useIntl();
  return (
    <Field
      form={form}
      name="username"
      type="text"
      value={form.getValues('username') || ''}
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
    />
  );
};

// Password field with visibility toggle and confirm trigger
export const RegisterAccountPassword = ({ form }: { form: UseFormReturn<PlanDetailsRegisterPageData> }) => {
  const intl = useIntl();
  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => setShowPassword((s) => !s);
  return (
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
        <PasswordVisibilityToggle
          isVisible={showPassword}
          onToggle={togglePasswordVisibility}
        />
      )}
      manageState={false}
      registerOptions={{
        onChange: async () => {
          if (form.getValues('confirmPassword')) {
            await form.trigger('confirmPassword');
          }
        },
      }}
    />
  );
};

// Confirm password field with visibility toggle
export const RegisterAccountConfirmPassword = ({ form }: { form: UseFormReturn<PlanDetailsRegisterPageData> }) => {
  const intl = useIntl();
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword((s) => !s);
  return (
    <Field
      form={form}
      name="confirmPassword"
      value={form.getValues('confirmPassword') || ''}
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
        <PasswordVisibilityToggle
          isVisible={showConfirmPassword}
          onToggle={toggleConfirmPasswordVisibility}
        />
      )}
    />
  );
};

// Country field (read-only/disabled)
export const RegisterAccountCountry = ({
  form,
}: {
  form: UseFormReturn<PlanDetailsRegisterPageData>;
}) => {
  const intl = useIntl();
  const countryOptions = useCountryOptions();
  return (
    <Field
      form={form}
      name="country"
      type="select"
      value={form.getValues('country') || ''}
      options={countryOptions}
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
  );
};

const RegisterAccountFields = ({ form }: RegisterAccountFieldsProps) => {
  const { isLoading } = useRecaptchaToken('submit');
  if (isLoading) {
    return null;
  }
  return (
    <FieldContainer>
      <RegisterAccountFieldsHeader />
      <Stack gap={3}>
        <RegisterAccountAdminEmail form={form} />
        <RegisterAccountFullName form={form} />
        <RegisterAccountUsername form={form} />
        <RegisterAccountPassword form={form} />
        <RegisterAccountConfirmPassword form={form} />
        <RegisterAccountCountry form={form} />
      </Stack>
    </FieldContainer>
  );
};

export default RegisterAccountFields;
