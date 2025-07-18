import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button, Form, Stack, StatefulButton, Stepper,
} from '@openedx/paragon';
import { Lock } from '@openedx/paragon/icons';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import LoginFields from '@/components/FormFields/LoginFields';
import RegisterAccountFields from '@/components/FormFields/RegisterAccountFields';
import { CreateAccountSchema, BuildTrialSchema, CheckoutStep } from '@/components/Stepper/constants';
import PriceAlert from '@/components/Stepper/Steps/PriceAlert';
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

const OrganizationEmailHelpText: React.FC<OrganizatonEmailHelpTextProps> = ({ isInvalid }) => {
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

OrganizationEmailHelpText.propTypes = {
  isInvalid: PropTypes.bool.isRequired,
};

const CreateAccount: React.FC = () => {
  const navigate = useNavigate();
  const planFormData = useCheckoutFormStore((state) => state.formData.buildTrial);
  const accountFormData = useCheckoutFormStore((state) => state.formData.createAccount);
  const [existingUserEmail, setExistingUserEmail] = useState(false);
  useEffect(() => {
    if (!planFormData || !BuildTrialSchema.safeParse(planFormData).success) {
      navigate(`/${CheckoutStep.BuildTrial}`);
    }
  }, [planFormData, navigate]);

  const setFormData = useCheckoutFormStore((state) => state.setFormData);
  const form = useForm<CreateAccountData>({
    mode: 'onBlur',
    resolver: zodResolver(CreateAccountSchema),
  });

  const {
    handleSubmit,
    formState: { isValid },
  } = form;
  const AccountDetailComponent = existingUserEmail
    ? (<LoginFields form={form} />)
    : (<RegisterAccountFields form={form} />);

  const handlePrevious = () => {
    navigate(`/${CheckoutStep.BuildTrial}`);
  };

  const onSubmit = (data: CreateAccountData) => {
    setFormData('createAccount', data);
    navigate(`/${CheckoutStep.CreateAccessLink}`);
  };

  const eventKey = CheckoutStep.CreateAccount;

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Helmet title="Account Details" />
      <Stack gap={4}>
        <Stepper.Step eventKey={eventKey} title="Account Details">
          <h1 className="mb-5 text-center">
            <FormattedMessage
              id="checkout.accountDetails.title"
              defaultMessage="Set up your account"
              description="Title for the account details step"
            />
          </h1>
          <PriceAlert />
          {existingUserEmail
            ? <LoginFields form={form} />
            : <RegisterAccountFields form={form} />}
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

export default CreateAccount;
