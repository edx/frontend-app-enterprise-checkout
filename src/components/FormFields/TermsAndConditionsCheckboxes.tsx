import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { Form } from '@openedx/paragon';
import { isEmpty } from 'lodash-es';
import { Controller, type UseFormReturn } from 'react-hook-form';

import { useCheckoutIntent, usePurchaseSummaryPricing } from '@/components/app/data';
import { termsAndConditions } from '@/components/app/data/constants';
import { DisplayPrice } from '@/components/DisplayPrice';
import { DataStoreKey } from '@/constants/checkout';
import EVENT_NAMES from '@/constants/events';
import { useCheckoutFormStore } from '@/hooks/useCheckoutFormStore';
import { sendEnterpriseCheckoutTrackingEvent } from '@/utils/common';

interface TermsAndConditionsCheckboxesProps {
  form: UseFormReturn<BillingDetailsData>;
}

/**
 * BillingDetailsData should include:
 *  - confirmTnC: boolean
 *  - confirmSubscription: boolean
 *  - confirmRecurringSubscription: boolean
 */
const TermsAndConditionsCheckboxes = ({ form }: TermsAndConditionsCheckboxesProps) => {
  const {
    control,
    formState: { errors },
  } = form;

  // Watch both source fields
  const billingDetailsData = useCheckoutFormStore(state => state.formData[DataStoreKey.BillingDetails]);
  const setFormData = useCheckoutFormStore(state => state.setFormData);
  const { data: checkoutIntent } = useCheckoutIntent();
  const {
    yearlySubscriptionCostForQuantity,
  } = usePurchaseSummaryPricing();

  const sendCheckBoxEvent = (eventName: string, value: boolean) => {
    const checkoutIntentId = checkoutIntent?.id ?? null;
    sendEnterpriseCheckoutTrackingEvent({
      checkoutIntentId,
      eventName,
      properties: {
        checkbox_checked: value,
      },
    });
  };

  return (
    <Form.CheckboxSet
      name="userDisclosureAndConsent"
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
              sendCheckBoxEvent(
                EVENT_NAMES.SUBSCRIPTION_CHECKOUT.TOGGLE_TNC_TERMS,
                e.currentTarget.checked,
              );
              setFormData(
                DataStoreKey.BillingDetails,
                {
                  ...billingDetailsData,
                  confirmTnC: e.currentTarget.checked,
                },
              );
            }}
            value="confirmTnC"
            isInvalid={!!errors.confirmTnC}
          >
            <FormattedMessage
              id="checkout.termsAndConditionsCheckboxes.confirmTnC"
              defaultMessage={termsAndConditions.readAndAcceptProductDescriptionsMessage}
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
              sendCheckBoxEvent(
                EVENT_NAMES.SUBSCRIPTION_CHECKOUT.TOGGLE_SUBSCRIPTION_TERMS,
                e.currentTarget.checked,
              );
              setFormData(
                DataStoreKey.BillingDetails,
                {
                  ...billingDetailsData,
                  confirmSubscription: e.currentTarget.checked,
                },
              );
            }}
            value="confirmSubscription"
            isInvalid={!!errors.confirmSubscription}
          >
            <FormattedMessage
              id="checkout.termsAndConditionsCheckboxes.confirmSubscription"
              defaultMessage={termsAndConditions.confirmSubscribingMessage}
              description="Checkbox label to confirm the subscription is on behalf of an organization for use by its employees, students, or other sponsored learners"
            />
          </Form.Checkbox>
        )}
      />
      <Controller
        name="confirmRecurringSubscription"
        control={control}
        render={({ field: { onChange, onBlur, ref } }) => (
          <Form.Checkbox
            inputRef={ref}
            checked={billingDetailsData.confirmRecurringSubscription}
            onBlur={onBlur}
            onChange={(e) => {
              onChange(e.currentTarget.checked);
              sendCheckBoxEvent(
                EVENT_NAMES.SUBSCRIPTION_CHECKOUT.TOGGLE_SUBSCRIPTION_TERMS,
                e.currentTarget.checked,
              );
              setFormData(
                DataStoreKey.BillingDetails,
                {
                  ...billingDetailsData,
                  confirmRecurringSubscription: e.currentTarget.checked,
                },
              );
            }}
            value="confirmRecurringSubscription"
            isInvalid={!!errors.confirmRecurringSubscription}
          >
            <FormattedMessage
              id="checkout.termsAndConditionsCheckboxes.confirmRecurringSubscription"
              defaultMessage={termsAndConditions.agreeToRecurringSubscriptionMessage}
              description="Checkbox label to confirm the recurring subscription with price"
              values={{
                price: (<DisplayPrice value={yearlySubscriptionCostForQuantity ?? 0} />),
              }}
            />
          </Form.Checkbox>
        )}
      />
    </Form.CheckboxSet>
  );
};

export default TermsAndConditionsCheckboxes;
