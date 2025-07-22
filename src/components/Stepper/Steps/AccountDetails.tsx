import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button, Form, Stack, StatefulButton, Stepper,
} from '@openedx/paragon';
import { Lock } from '@openedx/paragon/icons';
import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import {
  AccountDetailsSchema,
  PlanDetailsSchema,
  CheckoutStepKey,
  CheckoutStepperPath,
} from '@/components/Stepper/constants';
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

const AccountDetails: React.FC = () => {
  const navigate = useNavigate();
  const planFormData = useCheckoutFormStore((state) => state.formData.planDetails);
  const accountFormData = useCheckoutFormStore((state) => state.formData.createAccount);
  useEffect(() => {
    if (!planFormData || !PlanDetailsSchema.safeParse(planFormData).success) {
      navigate(CheckoutStepperPath.PlanDetailsRoute);
    }
  }, [planFormData, navigate]);

  const setFormData = useCheckoutFormStore((state) => state.setFormData);
  const form = useForm<AccountDetailsData>({
    mode: 'onBlur',
    resolver: zodResolver(AccountDetailsSchema),
  });

  const {
    handleSubmit,
    formState: { isValid },
  } = form;

  const handlePrevious = () => {
    navigate(CheckoutStepperPath.PlanDetailsRoute);
  };

  const onSubmit = (data: AccountDetailsData) => {
    setFormData('createAccount', data);
    navigate(CheckoutStepperPath.BillingDetailsRoute);
  };

  const eventKey = CheckoutStepKey.AccountDetails;

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
