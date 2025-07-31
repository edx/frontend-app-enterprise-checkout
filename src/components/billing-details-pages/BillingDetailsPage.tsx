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
import { useParams } from 'react-router';
import { useNavigate } from 'react-router-dom';

import useStepperContent from '@/components/Stepper/Steps/hooks/useStepperContent';
import { determineStepperButtonText, determineStepperTitleText } from '@/components/Stepper/utils';
import {
  BillingDetailsSchema,
  CheckoutStepKey,
  CheckoutStepperPath, CheckoutSubstepKey,
} from '@/constants/checkout';
import useCheckoutFormStore from '@/hooks/useCheckoutFormStore';

const BillingDetailsPage: React.FC = () => {
  const intl = useIntl();
  const { step, substep } = useParams<{ step: CheckoutStepKey, substep: CheckoutSubstepKey }>();
  const isSuccessPage = substep === CheckoutSubstepKey.Success;

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

  const StepperContent = useStepperContent();

  const eventKey = CheckoutStepKey.BillingDetails;
  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Helmet title="Billing Details" />
      <Stack gap={4}>
        <Stepper.Step eventKey={eventKey} title="Billing Details">
          <h1 className="mb-5 text-center" data-testid="stepper-title">
            {intl.formatMessage(determineStepperTitleText({ step, substep }), { firstName: 'Don' })}
          </h1>
          <StepperContent />
        </Stepper.Step>
        {!isSuccessPage && (
        <Stepper.ActionRow eventKey={eventKey}>
          <Button
            variant="secondary"
            type="submit"
          >
            {intl.formatMessage(determineStepperButtonText({ step, substep }))}
          </Button>
        </Stepper.ActionRow>
        )}
      </Stack>
    </Form>
  );
};
export default BillingDetailsPage;
