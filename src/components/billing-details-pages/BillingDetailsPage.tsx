import { useIntl } from '@edx/frontend-platform/i18n';
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
  CheckoutPageDetails,
  CheckoutStepKey,
} from '@/constants/checkout';
import useCheckoutFormStore from '@/hooks/useCheckoutFormStore';
import useCurrentPageDetails from '@/hooks/useCurrentPageDetails';

const BillingDetailsPage: React.FC = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const billingDetailsData = useCheckoutFormStore((state) => state.formData.BillingDetails);
  const setFormData = useCheckoutFormStore((state) => state.setFormData);
  const form = useForm<AccountDetailsData>({
    mode: 'onBlur',
    resolver: zodResolver(BillingDetailsSchema),
    defaultValues: billingDetailsData,
  });
  const {
    title: pageTitle,
    buttonMessage: stepperActionButtonMessage,
  } = useCurrentPageDetails();
  const {
    handleSubmit,
  } = form;

  const onSubmit = (data: AccountDetailsData) => {
    setFormData('BillingDetails', data);
    navigate(CheckoutPageDetails.BillingDetailsSuccess.route);
  };

  const eventKey = CheckoutStepKey.BillingDetails;
  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Helmet title="Billing Details" />
      <Stack gap={4}>
        <Stepper.Step eventKey={eventKey} title="Billing Details">
          <h1 className="mb-5 text-center">
            {intl.formatMessage(pageTitle)}
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
            {stepperActionButtonMessage ? intl.formatMessage(stepperActionButtonMessage) : ''}
          </Button>
        </Stepper.ActionRow>
      </Stack>
    </Form>
  );
};
export default BillingDetailsPage;
