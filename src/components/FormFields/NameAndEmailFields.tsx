import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';
import { Stack } from '@openedx/paragon';
import { useContext } from 'react';

import { useCountryOptions } from '@/components/app/data/hooks';
import useBFFContext from '@/components/app/data/hooks/useBFFContext';
import { FieldContainer } from '@/components/FieldContainer';
import { CHECKOUT_STEPS, PLAN_TYPE, TRACKED_FIELDS } from '@/constants/tracking';
import { useFieldTracking } from '@/hooks/useFieldTracking';

import Field from './Field';

import type { UseFormReturn } from 'react-hook-form';

interface NameAndEmailFieldsProps {
  form: UseFormReturn<PlanDetailsData>;
}

const NameAndEmailFields = ({ form }: NameAndEmailFieldsProps) => {
  const intl = useIntl();
  const countryOptions = useCountryOptions();
  const { authenticatedUser }: AppContextValue = useContext(AppContext);
  const { data: bffContext } = useBFFContext(authenticatedUser?.userId || null);
  const checkoutIntentId = bffContext?.checkoutIntent?.id || null;

  const handleFullNameBlur = useFieldTracking({
    fieldName: TRACKED_FIELDS.FULL_NAME,
    step: CHECKOUT_STEPS.PLAN_DETAILS,
    checkoutIntentId,
    additionalProperties: {
      plan_type: PLAN_TYPE.TEAMS,
    },
  });

  const handleAdminEmailBlur = useFieldTracking({
    fieldName: TRACKED_FIELDS.ADMIN_EMAIL,
    step: CHECKOUT_STEPS.PLAN_DETAILS,
    checkoutIntentId,
    additionalProperties: {
      plan_type: PLAN_TYPE.TEAMS,
    },
  });

  const handleCountryBlur = useFieldTracking({
    fieldName: TRACKED_FIELDS.COUNTRY,
    step: CHECKOUT_STEPS.PLAN_DETAILS,
    checkoutIntentId,
    additionalProperties: {
      plan_type: PLAN_TYPE.TEAMS,
    },
  });

  return (
    <FieldContainer>
      <div className="mb-3">
        <h3>
          <FormattedMessage
            id="checkout.NameAndEmailFields.title"
            defaultMessage="What is your name and email?"
            description="Title for the name and email section"
          />
        </h3>
        <p className="h4 font-weight-light">
          <FormattedMessage
            id="checkout.NameAndEmailFields.description"
            defaultMessage="Please use your work email to build your team's subscription trial."
            description="Description text explaining the name and email purpose"
          />
        </p>
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
          controlClassName="mr-0"
          className="bg-light-300"
          onBlur={handleFullNameBlur}
        />

        <Field
          form={form}
          name="adminEmail"
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
          controlClassName="mr-0"
          onBlur={handleAdminEmailBlur}
        />
        <Field
          form={form}
          name="country"
          type="select"
          options={countryOptions}
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
          controlClassName="mr-0"
          onBlur={handleCountryBlur}
        />
      </Stack>
    </FieldContainer>
  );
};

export default NameAndEmailFields;
