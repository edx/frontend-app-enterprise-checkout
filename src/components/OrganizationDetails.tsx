import {
  Button, Form, Stack, Stepper,
} from '@openedx/paragon';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCheckoutFormStore } from '@/hooks';
import { Step2Schema, steps } from '@/constants';

const OrganizationDetails: React.FC = () => {
  const {
    formData: initialFormData,
    handlePrevious,
    handleNext,
    setFormData,
  } = useCheckoutFormStore();
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<Step2Data>({
    mode: 'onTouched',
    resolver: zodResolver(Step2Schema),
    defaultValues: initialFormData.organization,
  });

  const eventKey = steps[1];

  const onSubmit = (data: Step2Data) => {
    setFormData('organization', data);
    handleNext();
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Stack gap={4}>
        <Stepper.Step eventKey={eventKey} title="Organization Details">
          <h1 className="h2 mb-4.5">Set up your account</h1>
          <Stack gap={3}>
            <Form.Group isInvalid={!!errors.fullName}>
              <Form.Control
                {...register('fullName')}
                type="text"
                defaultValue={initialFormData.organization?.fullName}
                floatingLabel="Full name"
                placeholder="John Doe"
                className="mr-0"
                autoFocus
              />
              {errors.fullName?.message && (
                <Form.Control.Feedback>
                  {errors.fullName.message}
                </Form.Control.Feedback>
              )}
            </Form.Group>
            <Form.Group isInvalid={!!errors.orgEmail}>
              <Form.Control
                {...register('orgEmail')}
                type="email"
                defaultValue={initialFormData.organization?.orgEmail}
                floatingLabel="Organization email"
                placeholder="john.doe@organization.com"
                className="mr-0"
                // trailingElement={<Spinner animation="border" className="spinner-border-sm text-muted" />}
              />
              {errors.orgEmail?.message && (
                <Form.Control.Feedback>
                  {errors.orgEmail.message}
                </Form.Control.Feedback>
              )}
              <Form.Text>
                Use your official organization email address.
              </Form.Text>
            </Form.Group>
            <Form.Group isInvalid={!!errors.orgName}>
              <Form.Control
                {...register('orgName')}
                type="text"
                defaultValue={initialFormData.organization?.orgName}
                floatingLabel="Organization name"
                placeholder="Organization"
                className="mr-0"
                // trailingElement={<Spinner animation="border" className="spinner-border-sm text-muted" />}
              />
              {errors.orgName?.message && (
                <Form.Control.Feedback>
                  {errors.orgName.message}
                </Form.Control.Feedback>
              )}
            </Form.Group>
            <Form.Group isInvalid={!!errors.country}>
              <Form.Control
                {...register('country')}
                as="select"
                defaultValue={initialFormData.organization?.country}
                floatingLabel="Country/Region"
                className="mr-0"
              >
                <option value="">Select a country/region</option>
                <option value="US">United States</option>
                <option value="CA">Canada</option>
              </Form.Control>
              {errors.country?.message && (
                <Form.Control.Feedback>
                  {errors.country.message}
                </Form.Control.Feedback>
              )}
            </Form.Group>
          </Stack>
        </Stepper.Step>
        <Stepper.ActionRow eventKey={eventKey} className="flex-row-reverse">
          <Button type="submit" disabled={!isValid}>
            Next step
          </Button>
          <Stepper.ActionRow.Spacer />
          <Button
            variant="outline-primary"
            onClick={handlePrevious}
            className="ml-0"
          >
            Back
          </Button>
        </Stepper.ActionRow>
      </Stack>
    </Form>
  );
};

export default OrganizationDetails;
