import PropTypes from 'prop-types';
import {
  ActionRow, Button, Card, Form, Icon, Stack, StatefulButton, Stepper,
} from '@openedx/paragon';
import { Helmet } from 'react-helmet';
import { CheckCircle, Edit, Lock } from '@openedx/paragon/icons';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import slugify from 'slugify';

import { useCheckoutFormStore } from '@/hooks';
import { Step2Schema, steps } from '@/constants';
import { useCallback, useEffect, useState } from 'react';

interface StatefulPurchaseButtonProps {
  isFormValid: boolean;
}

const StatefulPurchaseButton: React.FC<StatefulPurchaseButtonProps> = ({ isFormValid }) => {
  const intl = useIntl();
  const labels = {
    default: intl.formatMessage({
      id: 'checkout.startFreeTrial',
      defaultMessage: 'Start your free trial',
      description: 'Button to start the free trial',
    }),
    pending: intl.formatMessage({
      id: 'checkout.processing',
      defaultMessage: 'Processing...',
      description: 'Button text when processing',
    }),
  };
  return (
    <div>
      <StatefulButton
        labels={labels}
        variant="brand"
        type="submit"
        iconBefore={Lock}
        disabled={!isFormValid}
        className="mb-1"
        block
      >
        <FormattedMessage
          id="checkout.startFreeTrial"
          defaultMessage="Start your free trial"
          description="Button to start the free trial"
        />
      </StatefulButton>
      <span className="small text-right d-block">
        <FormattedMessage
          id="checkout.noCreditCardRequired"
          defaultMessage="No credit card required. Cancel anytime."
          description="Text indicating no credit card is required"
        />
      </span>
    </div>
  );
};

StatefulPurchaseButton.propTypes = {
  isFormValid: PropTypes.bool.isRequired,
};

const AccountDetails: React.FC = () => {
  const intl = useIntl();
  const organizationFormData = useCheckoutFormStore(useCallback((state) => state.formData.organization, []));
  const handlePrevious = useCheckoutFormStore((state) => state.handlePrevious);
  const handleNext = useCheckoutFormStore((state) => state.handleNext);
  const setFormData = useCheckoutFormStore(useCallback((state) => state.setFormData, []));
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
  } = useForm<Step2Data>({
    resolver: zodResolver(Step2Schema),
    defaultValues: organizationFormData,
  });
  const [isEditingSlug, setIsEditingSlug] = useState(false);

  const eventKey = steps[1];

  const onSubmit = (data: Step2Data) => {
    setFormData('organization', data);
    handleNext();
  };

  const fullName = watch('fullName');
  const orgEmail = watch('orgEmail');
  const orgName = watch('orgName');
  const orgSlug = watch('orgSlug');
  const country = watch('country');

  useEffect(() => {
    if (orgName) {
      setValue(
        'orgSlug',
        slugify(orgName, { lower: true, strict: true, trim: true }),
        { shouldValidate: true },
      );
    }
  }, [orgName, setValue]);

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Helmet title="Account Details" />
      <Stack gap={4}>
        <Stepper.Step eventKey={eventKey} title="Account Details">
          <h1 className="h2 mb-4.5">
            <FormattedMessage
              id="checkout.accountDetails.title"
              defaultMessage="Set up your account"
              description="Title for the account details step"
            />
          </h1>
          <Stack gap={3}>
            <Form.Group isInvalid={!!errors.fullName}>
              <Form.Control
                {...register('fullName')}
                type="text"
                defaultValue={organizationFormData?.fullName}
                floatingLabel={intl.formatMessage({
                  id: 'checkout.accountDetails.fullName',
                  defaultMessage: 'Full name',
                  description: 'Label for the full name field',
                })}
                placeholder="John Doe"
                className="mr-0"
                trailingElement={(fullName && !errors.fullName) && <Icon className="text-success" src={CheckCircle} />}
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
                defaultValue={organizationFormData?.orgEmail}
                floatingLabel={intl.formatMessage({
                  id: 'checkout.accountDetails.orgEmail',
                  defaultMessage: 'Organization email',
                  description: 'Label for the organization email field',
                })}
                placeholder="john.doe@organization.com"
                className="mr-0"
                trailingElement={(orgEmail && !errors.orgEmail) && <Icon className="text-success" src={CheckCircle} />}
              />
              {errors.orgEmail?.message && (
                <Form.Control.Feedback>
                  {errors.orgEmail.message}
                </Form.Control.Feedback>
              )}
              <Form.Text>
                <FormattedMessage
                  id="checkout.accountDetails.emailInfo"
                  defaultMessage="Use your official organization email address."
                  description="Info text for the email field"
                />
              </Form.Text>
            </Form.Group>
            <Form.Group isInvalid={!!errors.orgName}>
              <Form.Control
                {...register('orgName')}
                type="text"
                defaultValue={organizationFormData?.orgName}
                floatingLabel="Organization name"
                placeholder="Organization"
                className="mr-0"
                trailingElement={(orgName && !errors.orgName) && <Icon className="text-success" src={CheckCircle} />}
              />
              {errors.orgName?.message && (
                <Form.Control.Feedback>
                  {errors.orgName.message}
                </Form.Control.Feedback>
              )}
            </Form.Group>
            {orgName && !errors.orgName && (
              <Form.Group isInvalid={!!errors.orgSlug}>
                <Card variant="muted">
                  <Card.Section>
                    <Stack direction="horizontal" gap={2} className="justify-content-between align-items-center mb-1">
                      <h2 className="h4 mb-0">
                        <FormattedMessage
                          id="checkout.accountDetails.confirmAccessLink"
                          defaultMessage="Confirm your access link"
                          description="Heading for card previewing/editing the access link field"
                        />
                      </h2>
                      {!isEditingSlug && (
                        <Button
                          variant="link"
                          iconAfter={Edit}
                          size="sm"
                          onClick={() => setIsEditingSlug(true)}
                          className="p-0"
                        >
                          Edit
                        </Button>
                      )}
                    </Stack>
                    <p id="organization-access-link-description" className="small">
                      This is how users will access your organization on edX. It may not be changed later.
                    </p>
                    <Form.Control
                      {...register('orgSlug')}
                      type="text"
                      defaultValue={organizationFormData?.orgSlug}
                      aria-describedby="organization-access-link-description"
                      placeholder="slug"
                      className="mr-0"
                      trailingElement={(orgSlug && !errors.orgSlug) && <Icon className="text-success" src={CheckCircle} />}
                      readOnly={!isEditingSlug}
                      size="sm"
                    />
                    <Form.Text>{orgSlug.length}/30</Form.Text>
                    {errors.orgSlug?.message && (
                      <Form.Control.Feedback>
                        {errors.orgSlug.message}
                      </Form.Control.Feedback>
                    )}
                    {isEditingSlug && (
                      <ActionRow className="mt-2.5">
                        <Button
                          variant="teriary"
                          onClick={() => setIsEditingSlug(false)}
                          size="sm"
                        >
                          <FormattedMessage
                            id="checkout.accountDetails.cancel"
                            defaultMessage="Cancel"
                            description="Button to cancel editing"
                          />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => setIsEditingSlug(false)}
                          disabled={!!errors.orgSlug}
                        >
                          <FormattedMessage
                            id="checkout.accountDetails.saveChanges"
                            defaultMessage="Save changes"
                            description="Button to save changes"
                          />
                        </Button>
                      </ActionRow>
                    )}
                  </Card.Section>
                </Card>
              </Form.Group>
            )}
            <Form.Group isInvalid={!!errors.country}>
              <Form.Control
                {...register('country')}
                as="select"
                defaultValue={organizationFormData?.country}
                floatingLabel="Country/Region"
                className="mr-0"
                trailingElement={(country && !errors.country) && <Icon className="text-success" src={CheckCircle} />}
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
        <Stepper.ActionRow eventKey={eventKey} className="flex-row-reverse align-items-start">
          <StatefulPurchaseButton isFormValid={isValid} />
          <Stepper.ActionRow.Spacer />
          <Button
            variant="outline-primary"
            onClick={handlePrevious}
            className="ml-0"
          >
            <FormattedMessage
              id="checkout.back"
              defaultMessage="Back"
              description="Button to go back to the previous step"
            />
          </Button>
        </Stepper.ActionRow>
      </Stack>
    </Form>
  );
};

export default AccountDetails;
