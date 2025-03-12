import {
  Button, Form, Icon, SelectableBox, Stack, Stepper,
} from '@openedx/paragon';
import { Helmet } from 'react-helmet';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { useCheckoutFormStore } from '@/hooks';
import { Step1Schema, steps } from '@/constants';
import { CheckCircle } from '@openedx/paragon/icons';

const PlanDetails: React.FC = () => {
  const planFormData = useCheckoutFormStore((state) => state.formData.plan);
  const setFormData = useCheckoutFormStore((state) => state.setFormData);
  const handleNext = useCheckoutFormStore((state) => state.handleNext);
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<Step1Data>({
    mode: 'onTouched',
    resolver: zodResolver(Step1Schema),
    defaultValues: planFormData,
  });

  const onSubmit = (data: Step1Data) => {
    setFormData('plan', data);
    handleNext();
  };

  const eventKey = steps[0];
  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Helmet title="Plan Details" />
      <Stack gap={4}>
        <Stepper.Step eventKey={eventKey} title="Plan Details">
          <h1 className="h2 mb-4.5">
            <FormattedMessage
              id="checkout.planDetails.title"
              defaultMessage="Build your free trial subscription"
            />
          </h1>
          <Stack gap={3}>
            <Form.Group isInvalid={!!errors.numUsers}>
              <Form.Control
                {...register('numUsers', {
                  onChange(event) {
                    const { value } = event.target;
                    setFormData('plan', {
                      ...planFormData,
                      numUsers: value ? parseInt(value, 10) : undefined,
                    });
                  },
                })}
                type="number"
                floatingLabel="How many users?"
                placeholder="eg. 10"
                trailingElement={(planFormData?.numUsers && !errors.numUsers) && <Icon className="text-success" src={CheckCircle} />}
                autoFocus
              />
              {errors.numUsers?.message && (
                <Form.Control.Feedback>
                  {errors.numUsers.message}
                </Form.Control.Feedback>
              )}
            </Form.Group>
            <Controller
              name="planType"
              control={control}
              defaultValue="annual"
              render={({ field: { value, onChange } }) => (
                <Form.Group>
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
