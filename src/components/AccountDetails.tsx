import { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import {
  ActionRow, Button, Card, Form, Stack, StatefulButton, Stepper,
} from '@openedx/paragon';
import { Edit, Lock } from '@openedx/paragon/icons';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import slugify from 'slugify';

import { useCheckoutFormStore } from '@/hooks';
import { Step2Schema, steps } from '@/constants';
import Field from '@/components/Field';

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

interface OrganizatonEmailHelpTextProps {
  isInvalid: boolean;
}

const OrganizatonEmailHelpText: React.FC<OrganizatonEmailHelpTextProps> = ({ isInvalid }) => {
  if (isInvalid) {
    return null;
  }
  return (
    <Form.Text>
      <FormattedMessage
        id="checkout.accountDetails.emailInfo"
        defaultMessage="Use your official organization email address."
        description="Info text for the email field"
      />
    </Form.Text>
  );
};

OrganizatonEmailHelpText.propTypes = {
  isInvalid: PropTypes.bool.isRequired,
};

const AccountDetails: React.FC = () => {
  const intl = useIntl();
  const currentStep = useCheckoutFormStore((state) => state.currentStep);
  const accountFormData = useCheckoutFormStore(useCallback((state) => state.formData.account, []));
  const handlePrevious = useCheckoutFormStore((state) => state.handlePrevious);
  const handleNext = useCheckoutFormStore((state) => state.handleNext);
  const setFormData = useCheckoutFormStore(useCallback((state) => state.setFormData, []));
  const form = useForm<Step2Data>({
    mode: 'onTouched',
    resolver: zodResolver(Step2Schema),
    defaultValues: accountFormData,
  });
  const {
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = form;
  const [isEditingSlug, setIsEditingSlug] = useState(false);

  const onSubmit = (data: Step2Data) => {
    setFormData('account', data);
    handleNext();
  };

  const orgName = watch('orgName');
  const orgSlug = watch('orgSlug');

  useEffect(() => {
    if (orgName) {
      setValue(
        'orgSlug',
        slugify(orgName, { lower: true, strict: true, trim: true }),
        {
          shouldValidate: true,
          shouldTouch: true,
        },
      );
    }
  }, [orgName, setValue]);

  const eventKey = steps[1];

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      {currentStep === eventKey && (
        <Helmet title="Account Details" />
      )}
      <Stack gap={4}>
        <Stepper.Step eventKey={eventKey} title="Account Details">
          <h1 className="h2 mb-4.5">
            <FormattedMessage
              id="checkout.accountDetails.title"
              defaultMessage="Set up your account"
              description="Title for the account details step"
            />
          </h1>
          <Stack gap={4}>
            <Field
              form={form}
              name="fullName"
              type="text"
              defaultValue={accountFormData?.fullName}
              floatingLabel={intl.formatMessage({
                id: 'checkout.accountDetails.fullName',
                defaultMessage: 'Full name',
                description: 'Label for the full name field',
              })}
              placeholder="John Doe"
              className="mr-0"
              autoFocus
            />
            <Field
              form={form}
              name="orgEmail"
              type="email"
              defaultValue={accountFormData?.orgEmail}
              floatingLabel={intl.formatMessage({
                id: 'checkout.accountDetails.orgEmail',
                defaultMessage: 'Organization email',
                description: 'Label for the organization email field',
              })}
              placeholder="john.doe@organization.com"
              className="mr-0"
              controlFooterNode={OrganizatonEmailHelpText}
            />
            <Field
              form={form}
              name="orgName"
              type="text"
              defaultValue={accountFormData?.orgName}
              floatingLabel="Organization name"
              placeholder="Organization"
              className="mr-0"
            >
              {({
                defaultControl,
                defaultErrorFeedback,
                isValid: isOrgNameValid,
              }) => (
                <>
                  {defaultControl}
                  {defaultErrorFeedback}
                  {isOrgNameValid && (
                    <Card variant="muted" className="mt-4">
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
                              <FormattedMessage
                                id="checkout.accountDetails.edit"
                                defaultMessage="Edit"
                                description="Button to edit the access link"
                              />
                            </Button>
                          )}
                        </Stack>
                        <Field
                          form={form}
                          name="orgSlug"
                          type="text"
                          defaultValue={accountFormData?.orgSlug}
                          validationOptions={{ shouldTouch: false }}
                          aria-describedby="organization-access-link-description"
                          placeholder="slug"
                          readOnly={!isEditingSlug}
                          size="sm"
                        >
                          {({
                            defaultControl: defaultSlugControl,
                            defaultErrorFeedback: defaultSlugErrorFeedback,
                          }) => (
                            <>
                              <p id="organization-access-link-description" className="small">
                                <FormattedMessage
                                  id="checkout.accountDetails.accessLinkDescription"
                                  defaultMessage="This is how users will access your organization on edX. It may not be changed later."
                                  description="Description for the access link field"
                                />
                              </p>
                              {defaultSlugControl}
                              <Form.Text className="align-items-right">
                                {orgSlug?.length || 0}/30
                              </Form.Text>
                              {defaultSlugErrorFeedback}
                            </>
                          )}
                        </Field>
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
                  )}
                </>
              )}
            </Field>
            <Field
              form={form}
              name="country"
              type="select"
              options={[
                {
                  value: 'US',
                  label: 'United States',
                },
                {
                  value: 'CA',
                  label: 'Canada',
                },
              ]}
              defaultValue={accountFormData?.country}
              floatingLabel="Country/Region"
              placeholder="Select a country/region"
              className="mr-0"
            />
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
