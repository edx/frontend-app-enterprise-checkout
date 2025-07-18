import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button, Form, Stack, Stepper,
} from '@openedx/paragon';
import { Helmet } from 'react-helmet';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import LicensesField from '@/components/FormFields/LicensesField';
import NameAndEmailFields from '@/components/FormFields/NameAndEmailFields';
import { BuildTrialSchema, CheckoutStep } from '@/components/Stepper/constants';
import PriceAlert from '@/components/Stepper/Steps/PriceAlert';
import useCheckoutFormStore from '@/hooks/useCheckoutFormStore';
import './css/PriceAlert.css';

const BuildTrial: React.FC = () => {
  const planFormData = useCheckoutFormStore((state) => state.formData.buildTrial);
  const setFormData = useCheckoutFormStore((state) => state.setFormData);
  const navigate = useNavigate();

  const form = useForm<BuildTrialData>({
    mode: 'onTouched',
    resolver: zodResolver(BuildTrialSchema),
    defaultValues: planFormData,
  });
  const {
    handleSubmit,
    formState: { isValid },
  } = form;

  const onSubmit = (data: BuildTrialData) => {
    setFormData('buildTrial', data);
    navigate(`/${CheckoutStep.CreateAccount}`);
  };

  const eventKey = CheckoutStep.BuildTrial;
  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Helmet title="Build Trial" />
      <Stack gap={4}>
        <Stepper.Step eventKey={eventKey} title="Build Trial">
          <h1 className="mb-5 text-center">
            <FormattedMessage
              id="checkout.buildTrial.title"
              defaultMessage="Build your free trial"
            />
          </h1>
          <Stack gap={4}>
            <PriceAlert />
            <LicensesField form={form} />
            <NameAndEmailFields form={form} />
          </Stack>
        </Stepper.Step>
        <Stepper.ActionRow eventKey={eventKey}>
          <Button
            variant="brand"
            type="submit"
            disabled={!isValid}
          >
            <FormattedMessage
              id="checkout.planDetails.continue"
              defaultMessage="Continue"
              description="Button label for the next step in the plan details step"
            />
          </Button>
        </Stepper.ActionRow>
      </Stack>
    </Form>
  );
};

export default BuildTrial;
