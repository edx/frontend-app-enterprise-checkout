import {
  Button, Form, SelectableBox, Stack, Stepper,
} from '@openedx/paragon';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import { PlanSchema, steps } from '@/constants';
import Field, { useIsFieldInvalid, useIsFieldValid } from '@/components/Field';
import StepCounter from '@/components/StepCounter';
import useCheckoutFormStore from '@/hooks/useCheckoutFormStore';

const PlanDetails: React.FC = () => {
  const planFormData = useCheckoutFormStore((state) => state.formData.plan);
  const setFormData = useCheckoutFormStore((state) => state.setFormData);
  const navigate = useNavigate();

  const form = useForm<PlanData>({
    mode: 'onTouched',
    resolver: zodResolver(PlanSchema),
    defaultValues: planFormData,
  });
  const {
    handleSubmit,
    control,
    formState: { isValid },
  } = form;

  const onSubmit = (data: PlanData) => {
    setFormData('plan', data);
    navigate('/checkout/account');
  };

  const isFieldValid = useIsFieldValid(form);
  const isFieldInvalid = useIsFieldInvalid(form);

  const eventKey = steps[0];
  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Helmet title="Plan Details" />
      <Stack gap={4}>
        <Stepper.Step eventKey={eventKey} title="Plan Details">
          <StepCounter />
          <h1 className="mb-5">
            <FormattedMessage
              id="checkout.planDetails.title"
              defaultMessage="Build your free trial subscription"
            />
          </h1>
          <Stack gap={3}>
            <Field
              form={form}
              name="numUsers"
              type="number"
              floatingLabel="How many users?"
              placeholder="eg. 10"
              min="0"
              className="mr-0"
              registerOptions={{
                validate: () => {
                  // Check react-hook-form docs for more info...
                },
              }}
              autoFocus
            />
            <Controller
              name="planType"
              control={control}
              defaultValue={planFormData?.planType || 'annual'}
              render={({ field: { value, onChange } }) => (
                <Form.Group
                  isValid={isFieldValid('planType')}
                  isInvalid={isFieldInvalid('planType')}
                >
                  <Form.Label className="mb-2.5">
                    <FormattedMessage
                      id="checkout.planDetails.planType"
                      defaultMessage="How will you pay?"
                      description="Label for the plan type field"
                    />
                  </Form.Label>
                  <SelectableBox.Set
                    type="radio"
                    ariaLabelledby="planTypeLabel"
                    value={value}
                    onChange={(e) => {
                      setFormData('plan', {
                        ...planFormData,
                        planType: e.target.value as PlanType,
                      });
                      onChange(e);
                    }}
                    name="planType"
                  >
                    <SelectableBox value="annual" aria-label="annual">
                      <h3 className="d-inline-block h4 mb-0">
                        <FormattedMessage
                          id="checkout.planDetails.annual"
                          defaultMessage="Annual"
                          description="Label for the annual plan type"
                        />
                      </h3>
                      <p className="small mb-0">
                        <FormattedMessage
                          id="checkout.planDetails.annualDescription"
                          defaultMessage="Billed once a year"
                          description="Description for the annual plan type"
                        />
                      </p>
                    </SelectableBox>
                    <SelectableBox value="quarterly" aria-label="quarterly">
                      <h3 className="d-inline-block h4 mb-0">
                        <FormattedMessage
                          id="checkout.planDetails.quarterly"
                          defaultMessage="Quarterly"
                          description="Label for the quarterly plan type"
                        />
                      </h3>
                      <p className="small mb-0">
                        <FormattedMessage
                          id="checkout.planDetails.quarterlyDescription"
                          defaultMessage="Billed 4 times a year"
                          description="Description for the quarterly plan type"
                        />
                      </p>
                    </SelectableBox>
                  </SelectableBox.Set>
                </Form.Group>
              )}
            />
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

export default PlanDetails;
