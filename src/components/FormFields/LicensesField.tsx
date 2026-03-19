import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';
import { useContext } from 'react';

import useBFFContext from '@/components/app/data/hooks/useBFFContext';
import { FieldContainer } from '@/components/FieldContainer';
import { CHECKOUT_STEPS, PLAN_TYPE, TRACKED_FIELDS } from '@/constants/events';
import { useFieldTracking } from '@/hooks/useFieldTracking';

import Field from './Field';

import type { UseFormReturn } from 'react-hook-form';

interface LicensesFieldProps {
  form: UseFormReturn<PlanDetailsData>;
}

const LicensesField = ({ form }: LicensesFieldProps) => {
  const intl = useIntl();
  const { authenticatedUser }: AppContextValue = useContext(AppContext);
  const { data: bffContext } = useBFFContext(authenticatedUser?.userId || null);
  const checkoutIntentId = bffContext?.checkoutIntent?.id || null;

  const handleBlur = useFieldTracking({
    fieldName: TRACKED_FIELDS.NUM_LICENSES,
    step: CHECKOUT_STEPS.PLAN_DETAILS,
    checkoutIntentId,
    additionalProperties: {
      plan_type: PLAN_TYPE.TEAMS,
    },
  });

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
        <p className="fs-4 font-weight-light">
          <FormattedMessage
            id="checkout.licensesField.description"
            defaultMessage="Enter in the number of licenses you want to purchase. As an administrator, you can issue and swap licenses between employees."
            description="Description text explaining the licenses field purpose"
          />
        </p>
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
        onBlur={handleBlur}
      />
    </FieldContainer>
  );
};

export default LicensesField;
