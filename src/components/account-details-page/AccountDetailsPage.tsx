import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Form,
  Stack,
  Stepper,
} from '@openedx/paragon';
import { Helmet } from 'react-helmet';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import CustomUrlField from '@/components/FormFields/CustomUrlField';
import OrganizationNameField from '@/components/FormFields/OrganizationNameField';
import {
  AccountDetailsSchema,
  CheckoutStepKey,
  CheckoutStepperPath,
} from '@/components/Stepper/constants';
import useCheckoutFormStore from '@/hooks/useCheckoutFormStore';

const AccountDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const accountFormData = useCheckoutFormStore((state) => state.formData.createAccount);

  const setFormData = useCheckoutFormStore((state) => state.setFormData);
  const form = useForm<AccountDetailsData>({
    mode: 'onBlur',
    resolver: zodResolver(AccountDetailsSchema),
    defaultValues: accountFormData,
  });
  const {
    handleSubmit,
  } = form;

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
              defaultMessage="Account Details"
              description="Title for the account details step"
            />
          </h1>
          <Stack gap={4}>
            <OrganizationNameField />
            <CustomUrlField />
          </Stack>
        </Stepper.Step>
        <Stepper.ActionRow eventKey={eventKey}>
          <Button
            variant="secondary"
            type="submit"
          >
            <FormattedMessage
              id="checkout.accountDetails.continue"
              defaultMessage="Continue"
              description="Button to go to the next page"
            />
          </Button>
        </Stepper.ActionRow>
      </Stack>
    </Form>
  );
};

export default AccountDetailsPage;
