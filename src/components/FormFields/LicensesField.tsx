import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';
import { Form } from '@openedx/paragon';
import { useContext } from 'react';

import { useFormValidationConstraints } from '@/components/app/data';
import useBFFContext from '@/components/app/data/hooks/useBFFContext';
import { ExternalLink } from '@/components/ExternalLink';
import { FieldContainer } from '@/components/FieldContainer';
import { getQuantityMaxValidationMessage } from '@/constants/checkout';
import { PLAN_TYPE, TRACKED_FIELDS } from '@/constants/events';
import useCurrentStep from '@/hooks/useCurrentStep';
import { trackFieldBlur } from '@/hooks/useFieldTracking';

import Field from './Field';

import type { UseFormReturn } from 'react-hook-form';

interface LicensesFieldProps {
  form: UseFormReturn<PlanDetailsData>;
}

const LicensesField = ({ form }: LicensesFieldProps) => {
  const intl = useIntl();
  const { authenticatedUser }: AppContextValue = useContext(AppContext);
  const { data: bffContext } = useBFFContext(authenticatedUser?.userId || null);
  const checkoutIntentId = bffContext?.checkoutIntent?.id ?? null;
  const checkoutIntentUuid = bffContext?.checkoutIntent?.uuid ?? null;
  const { currentStepKey, currentSubstepKey } = useCurrentStep();
  const { data: formValidationConstraints } = useFormValidationConstraints();
  const maxQuantity = formValidationConstraints?.quantity?.max ?? 50;

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
        onBlur={() => trackFieldBlur({
          fieldName: TRACKED_FIELDS.NUM_LICENSES,
          step: currentStepKey,
          substep: currentSubstepKey,
          checkoutIntentId,
          checkoutIntentUuid,
          additionalProperties: {
            plan_type: PLAN_TYPE.TEAMS,
          },
        })}
      >
        {({ defaultControl, defaultErrorFeedback }) => {
          const isMaxError = form.formState.errors.quantity?.type === 'too_big';
          if (!isMaxError) {
            return <>{defaultControl}{defaultErrorFeedback}</>;
          }

          const {
            beforeLink, linkText, afterLink, contactUrl,
          } = getQuantityMaxValidationMessage(maxQuantity);

          if (!contactUrl) {
            return <>{defaultControl}{defaultErrorFeedback}</>;
          }

          return (
            <>
              {defaultControl}
              <Form.Control.Feedback>
                {beforeLink}
                <ExternalLink href={contactUrl}>{linkText}</ExternalLink>
                {afterLink}
              </Form.Control.Feedback>
            </>
          );
        }}
      </Field>
    </FieldContainer>
  );
};

export default LicensesField;
