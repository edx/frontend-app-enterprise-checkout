import { FormattedMessage } from '@edx/frontend-platform/i18n';

import { FieldContainer } from '@/components/FieldContainer';

import type { UseFormReturn } from 'react-hook-form';

interface PlanDetailsProps {
  form: UseFormReturn<PlanDetailsData>;
}

// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const LoginFields = ({ form }: PlanDetailsProps) => (
  <FieldContainer>
    <div>
      <h3>
        <FormattedMessage
          id="checkout.loginFields.title"
          defaultMessage="Looks like you already have an account with this email"
          description="Title for the login account section"
        />
      </h3>
      <h3 className="font-weight-light">
        <FormattedMessage
          id="checkout.loginFields.description"
          defaultMessage="Please sign in or go back and use a different email."
          description="Description text explaining the login account purpose"
        />
      </h3>
    </div>
  </FieldContainer>
);

export default LoginFields;
