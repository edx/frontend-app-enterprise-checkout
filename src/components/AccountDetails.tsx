import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import {
  ActionRow, Button, Card, Form, Stack, StatefulButton, Stepper,
} from '@openedx/paragon';
import { Lock } from '@openedx/paragon/icons';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import slugify from 'slugify';

import { AccountSchema, steps } from '@/constants';
import Field from '@/components/Field';
import StepCounter from '@/components/StepCounter';
import useCheckoutFormStore from '@/hooks/useCheckoutFormStore';

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
  const navigate = useNavigate();
  const accountFormData = useCheckoutFormStore((state) => state.formData.account);
  const setFormData = useCheckoutFormStore((state) => state.setFormData);
  const form = useForm<AccountData>({
    mode: 'onTouched',
    resolver: zodResolver(AccountSchema),
  });
  const {
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = form;

  const [isEditingSlug, setIsEditingSlug] = useState(false);
  const orgSlugRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (orgSlugRef.current) {
      orgSlugRef.current.focus();
      orgSlugRef.current.select();
    }
  }, [isEditingSlug]);

  const handlePrevious = () => {
    navigate('/checkout/plan');
  };

  const onSubmit = (data: AccountData) => {
    setFormData('account', data);
    navigate('/checkout/confirmation');
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
      <Helmet title="Account Details" />
      <Stack gap={4}>
        <Stepper.Step eventKey={eventKey} title="Account Details">
          <StepCounter />
          <h1 className="mb-5">
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
              floatingLabel={intl.formatMessage({
                id: 'checkout.accountDetails.fullName',
                defaultMessage: 'Full name',
                description: 'Label for the full name field',
              })}
              placeholder="John Doe"
              defaultValue={accountFormData?.fullName}
              controlClassName="mr-0"
              autoFocus
            />
            <Field
              form={form}
              name="orgEmail"
              type="email"
              floatingLabel={intl.formatMessage({
                id: 'checkout.accountDetails.orgEmail',
                defaultMessage: 'Organization email',
                description: 'Label for the organization email field',
              })}
              placeholder="john.doe@organization.com"
              defaultValue={accountFormData?.orgEmail}
              controlClassName="mr-0"
              controlFooterNode={OrganizatonEmailHelpText}
            />
            <Field
              form={form}
              name="orgName"
              type="text"
              floatingLabel="Organization name"
              placeholder="Organization"
              defaultValue={accountFormData?.orgName}
              controlClassName="mr-0"
              registerOptions={{
                // onBlur: () => {
                //   if (orgName && orgSlugRef.current) {
                //     orgSlugRef.current.focus();
                //   }
                // },
              }}
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
                      <Card.Header
                        id="organization-access-link-description"
                        size="sm"
                        title={intl.formatMessage({
                          id: 'checkout.accountDetails.confirmAccessLink',
                          defaultMessage: 'Confirm your access link',
                          description: 'Heading for card previewing/editing the access link field',
                        })}
                        subtitle={intl.formatMessage({
                          id: 'checkout.accountDetails.confirmAccessLinkSubtitle',
                          defaultMessage: 'This is how users will access your organization on edX.',
                          description: 'Subtitle for card previewing/editing the access link field',
                        })}
                        actions={(
                          <ActionRow>
                            <Button
                              variant="link"
                              size="sm"
                              onClick={() => setIsEditingSlug(true)}
                              className="p-0"
                              disabled={isEditingSlug}
                            >
                              <FormattedMessage
                                id="checkout.accountDetails.edit"
                                defaultMessage="Edit"
                                description="Button to edit the access link"
                              />
                            </Button>
                          </ActionRow>
                        )}
                      />
                      <Card.Section>
                        <Field
                          ref={orgSlugRef}
                          form={form}
                          name="orgSlug"
                          type="text"
                          aria-describedby="organization-access-link-description"
                          placeholder="slug"
                          readOnly={!isEditingSlug}
                          defaultValue={accountFormData?.orgSlug}
                          className="mb-0"
                          controlClassName="mr-0"
                          size="sm"
                        >
                          {({
                            defaultControl: defaultSlugControl,
                            defaultErrorFeedback: defaultSlugErrorFeedback,
                          }) => (
                            <>
                              {defaultSlugControl}
                              <Form.Text>
                                {orgSlug?.length || 0}/30
                              </Form.Text>
                              {defaultSlugErrorFeedback}
                            </>
                          )}
                        </Field>
                      </Card.Section>
                      {isEditingSlug && (
                        <Card.Footer>
                          <ActionRow className="flex-row-reverse justify-content-start">
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
                          </ActionRow>
                        </Card.Footer>
                      )}
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
              controlClassName="mr-0"
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
