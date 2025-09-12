import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { Form } from '@openedx/paragon';
import { isEmpty } from 'lodash-es';
import { useEffect } from 'react';
import { Controller, type UseFormReturn, useWatch } from 'react-hook-form';

import { DataStoreKey } from '@/constants/checkout';
import { useCheckoutFormStore } from '@/hooks/useCheckoutFormStore';

interface TermsAndConditionsCheckboxesProps {
  form: UseFormReturn<BillingDetailsData>;
}

/**
 * BillingDetailsData should include:
 *  - confirmTnC: boolean
 *  - confirmSubscription: boolean
 *  - termsAndConditionAccepted?: boolean  // derived
 */
const TermsAndConditionsCheckboxes = ({ form }: TermsAndConditionsCheckboxesProps) => {
  const {
    control,
    setValue,
    formState: { errors },
  } = form;

  // Watch both source fields
  const billingDetailsData = useCheckoutFormStore(state => state.formData[DataStoreKey.BillingDetails]);
  const setFormData = useCheckoutFormStore(state => state.setFormData);
  const confirmTnC = useWatch({ control, name: 'confirmTnC', defaultValue: billingDetailsData.confirmTnC });
  const confirmSubscription = useWatch({ control, name: 'confirmSubscription', defaultValue: billingDetailsData.confirmSubscription });

  // Keep the derived field in sync so your Zod/Yup resolver or submit handler can use it
  useEffect(() => {
    const accepted = Boolean(confirmTnC && confirmSubscription);
    setFormData(
      DataStoreKey.BillingDetails,
      {
        confirmTnC,
        confirmSubscription,
        termsAndConditionAccepted: accepted,
      },
    );
    setValue('termsAndConditionAccepted', accepted, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
  }, [confirmTnC, confirmSubscription, setValue, setFormData]);

  return (
    <Form.CheckboxSet
      name="termsAndConditions"
      isInvalid={!isEmpty(errors)}
      aria-describedby={!isEmpty(errors) ? 'terms-and-conditions-feedback' : undefined}
      className="mt-2"
    >
      <Controller
        name="confirmTnC"
        control={control}
        render={({ field: { onChange, onBlur, ref } }) => (
          <Form.Checkbox
            inputRef={ref}
            checked={billingDetailsData.confirmTnC}
            onBlur={onBlur}
            onChange={(e) => {
              onChange(e.currentTarget.checked);
              setFormData(
                DataStoreKey.BillingDetails,
                {
                  ...billingDetailsData,
                  confirmTnC,
                },
              );
            }}
            value="confirmTnC"
            isInvalid={!!errors.confirmTnC}
          >
            <FormattedMessage
              id="checkout.termsAndConditionsCheckboxes.confirmTnC"
              defaultMessage="I have read and accepted the edX Enterprise Product Descriptions and Terms and edX Enterprise Sales Terms and Conditions."
              description="Checkbox label to confirm acceptance of edX Enterprise Product Descriptions, Terms, and Sales Terms and Conditions"
            />
          </Form.Checkbox>
        )}
      />
      <Controller
        name="confirmSubscription"
        control={control}
        render={({ field: { onChange, onBlur, ref } }) => (
          <Form.Checkbox
            inputRef={ref}
            checked={billingDetailsData.confirmSubscription}
            onBlur={onBlur}
            onChange={(e) => {
              onChange(e.currentTarget.checked);
              setFormData(
                DataStoreKey.BillingDetails,
                {
                  ...billingDetailsData,
                  confirmSubscription,
                },
              );
            }}
            value="confirmSubscription"
            isInvalid={!!errors.confirmSubscription}
          >
            <FormattedMessage
              id="checkout.termsAndConditionsCheckboxes.confirmSubscription"
              defaultMessage="I confirm I am subscribing on behalf of my employer, school or other professional organization for use by my institution's employees, students and/or other sponsored learners."
              description="Checkbox label to confirm the subscription is on behalf of an organization for use by its employees, students, or other sponsored learners"
            />
          </Form.Checkbox>
        )}
      />
    </Form.CheckboxSet>
  );
};

export default TermsAndConditionsCheckboxes;
