import {
  useCallback, useEffect, useRef, useState,
} from 'react';
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

import { AccountSchema, PlanSchema, steps } from '@/constants';
import Field from '@/components/Field';
import StepCounter from '@/components/StepCounter';
import useCheckoutFormStore from '@/hooks/useCheckoutFormStore';
import classNames from 'classnames';

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
  const planFormData = useCheckoutFormStore((state) => state.formData.plan);
  const accountFormData = useCheckoutFormStore((state) => state.formData.account);

  useEffect(() => {
    if (!planFormData || !PlanSchema.safeParse(planFormData).success) {
      navigate('/checkout/plan');
    }
  }, [planFormData, navigate]);

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
  const [originalOrgSlug, setOriginalOrgSlug] = useState(orgSlugRef.current?.value || '');

  useEffect(() => {
    if (orgSlugRef.current) {
      orgSlugRef.current.focus();
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

  const renderBoldText = useCallback(
    (chunks: React.ReactNode) => <span className="font-weight-bold">{chunks}</span>,
    [],
  );

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
                        title={(
                          <FormattedMessage
                            id="checkout.accountDetails.confirmAccessLink"
                            defaultMessage="Confirm your access link"
                            description="Heading for card previewing/editing the access link field"
                          />
                        )}
                        actions={(
                          <ActionRow>
                            <Button
                              variant="link"
                              size="inline"
                              onClick={() => {
                                setOriginalOrgSlug(orgSlugRef.current?.value || '');
                                setIsEditingSlug(true);
                              }}
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
                      <Card.Section className="small py-2">
                        <div id="organization-access-link-description">
                          <p>
                            <FormattedMessage
                              id="checkout.accountDetails.confirmAccessLinkSubtitle"
                              defaultMessage={
                                'This link defines how your organization will be accessed on edX (e.g., <b>*.edx.org/{slug}</b>). Once '
                                + 'set, changes to this link may disrupt user access.'
                              }
                              values={{
                                b: (chunks) => renderBoldText(chunks),
                                slug: orgSlug,
                              }}
                            />
                          </p>
                          <p className="font-italic">
                            <FormattedMessage
                              id="checkout.accountDetails.confirmAccessLink"
                              defaultMessage="<b>Tip:</b> Choose a short, memorable name that reflects your organization."
                              values={{
                                b: (chunks) => renderBoldText(chunks),
                              }}
                              description="Tip for choosing an access link"
                            />
                          </p>
                        </div>
                        <Field
                          ref={orgSlugRef}
                          form={form}
                          name="orgSlug"
                          type="text"
                          aria-describedby="organization-access-link-description"
                          placeholder="your-organization"
                          readOnly={!isEditingSlug}
                          defaultValue={accountFormData?.orgSlug}
                          className={classNames({ 'mb-0': isEditingSlug })}
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
                          <ActionRow>
                            <Button
                              variant="teriary"
                              onClick={() => {
                                if (orgSlugRef.current) {
                                  orgSlugRef.current.value = originalOrgSlug;
                                }
                                setIsEditingSlug(false);
                              }}
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
