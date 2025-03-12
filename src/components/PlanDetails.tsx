import {
  Button, Form, SelectableBox, Stack, Stepper,
} from '@openedx/paragon';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCheckoutFormStore } from '@/hooks';
import { Step1Schema, steps } from '@/constants';

const PlanDetails: React.FC = () => {
  const {
    formData: initialFormData,
    handleNext,
    setFormData,
  } = useCheckoutFormStore();
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<Step1Data>({
    mode: 'onTouched',
    resolver: zodResolver(Step1Schema),
    defaultValues: initialFormData.plan,
  });

  const onSubmit = (data: Step1Data) => {
    setFormData('plan', data);
    handleNext();
  };

  const eventKey = steps[0];
  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Stack gap={4}>
        <Stepper.Step eventKey={eventKey} title="Plan Details">
          <h1 className="h2 mb-4.5">Configure your subscription</h1>
          <Stack gap={3}>
            <Form.Group isInvalid={!!errors.numUsers}>
              <Form.Control
                {...register('numUsers', {
                  onChange: (e) => {
                    const { value } = e.target;
                    setFormData('plan', {
                      ...initialFormData.plan,
                      numUsers: value ? parseInt(value, 10) : undefined,
                    });
                  },
                })}
                type="number"
                floatingLabel="How many users?"
                placeholder="eg. 10"
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
                  <Form.Label>How will you pay?</Form.Label>
                  <SelectableBox.Set
                    type="radio"
                    ariaLabelledby="planTypeLabel"
                    value={value}
                    onChange={onChange}
                    name="planType"
                  >
                    <SelectableBox value="annual" aria-label="annual">
                      <h3 className="d-inline-block h4 mb-0">Annual</h3>
                      <p className="small mb-0">Billed once a year</p>
                    </SelectableBox>
                    <SelectableBox value="quarterly" aria-label="quarterly">
                      <h3 className="d-inline-block h4 mb-0">Quarterly</h3>
                      <p className="small mb-0">Billed 4 times a year</p>
                    </SelectableBox>
                  </SelectableBox.Set>
                </Form.Group>
              )}
            />
          </Stack>
        </Stepper.Step>
        <Stepper.ActionRow eventKey={eventKey}>
          <Button type="submit" disabled={!isValid}>
            Next step
          </Button>
        </Stepper.ActionRow>
      </Stack>
    </Form>
  );
};

export default PlanDetails;
