import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Form,
  Stack,
  Stepper,
} from '@openedx/paragon';
import { Helmet } from 'react-helmet';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { DataPrivacyPolicyField } from '@/components/FormFields';
import {
  BillingDetailsSchema,
  CheckoutStepKey,
  CheckoutStepperPath,
} from '@/constants/checkout';
import useCheckoutFormStore from '@/hooks/useCheckoutFormStore';

const BillingDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const billingDetailsData = useCheckoutFormStore((state) => state.formData.billingDetails);
  const setFormData = useCheckoutFormStore((state) => state.setFormData);

  const form = useForm<AccountDetailsData>({
    mode: 'onBlur',
    resolver: zodResolver(BillingDetailsSchema),
    defaultValues: billingDetailsData,
  });
  const {
    handleSubmit,
  } = form;

  const onSubmit = (data: AccountDetailsData) => {
    setFormData('billingDetails', data);
    navigate(CheckoutStepperPath.SuccessRoute);
  };

  const eventKey = CheckoutStepKey.BillingDetails;
  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Helmet title="Billing Details" />
      <Stack gap={4}>
        <Stepper.Step eventKey={eventKey} title="Billing Details">
          <h1 className="mb-5 text-center">
            <FormattedMessage
              id="checkout.billingDetails.title"
              defaultMessage="Billing Details"
              description="Title for the billing details step"
            />
          </h1>
          <Stack gap={4}>
            <DataPrivacyPolicyField />
          </Stack>
        </Stepper.Step>
        <Stepper.ActionRow eventKey={eventKey}>
          <Button
            variant="secondary"
            type="submit"
          >
            <FormattedMessage
              id="checkout.billingDetails.purchaseNow"
              defaultMessage="Purchase Now"
              description="Button to purchase the subscription product"
            />
          </Button>
        </Stepper.ActionRow>
      </Stack>
    </Form>
  );
};
export default BillingDetailsPage;
