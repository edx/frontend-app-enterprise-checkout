import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { Form } from '@openedx/paragon';

import { DataStoreKey } from '@/constants/checkout';
import { useCheckoutFormStore } from '@/hooks/useCheckoutFormStore';

const TermsAndConditionsCheckboxes = () => {
  const billingDetailsFormData = useCheckoutFormStore((state) => state.formData[DataStoreKey.BillingDetails]);

  const handleChange = (e) => {
    console.log(e.target.checked);
    console.log(billingDetailsFormData);
  };

  return (
    <Form.CheckboxSet
      name="TnC"
      onChange={handleChange}
    >
      <Form.Checkbox
        value="confirmTnC"
      >
        <FormattedMessage
          id="checkout.termsAndConditionsCheckboxes.confirmTnC"
          defaultMessage="I have read and accept the edX Enterprise Product Descriptions and Terms and edX Enterprise Sales Terms and Conditions."
          description="Checkbox label to confirm acceptance of edX Enterprise Product Descriptions, Terms, and Sales Terms and Conditions"
        />
      </Form.Checkbox>
      <Form.Checkbox
        value="confirmSubscription"
      >
        <FormattedMessage
          id="checkout.termsAndConditionsCheckboxes.confirmSubscription"
          defaultMessage="I confirm I am subscribing on behalf of my employer, school or other professional organization for use by my institution's employees, students and/or other sponsored learners."
          description="Checkbox label to confirm the subscription is on behalf of an organization for use by its employees, students, or other sponsored learners"
        />
      </Form.Checkbox>
    </Form.CheckboxSet>
  );
};

export default TermsAndConditionsCheckboxes;
