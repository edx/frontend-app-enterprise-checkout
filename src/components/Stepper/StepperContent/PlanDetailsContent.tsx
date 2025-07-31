import { AuthenticatedUserField, LicensesField, NameAndEmailFields } from '@/components/FormFields';
import useCheckoutFormStore from '@/hooks/useCheckoutFormStore';

import type { UseFormReturn } from 'react-hook-form';

interface PlanDetailsContentProps {
  form: UseFormReturn<PlanDetailsData>;
}

const PlanDetailsContent = ({ form }: PlanDetailsContentProps) => {
  const formData = useCheckoutFormStore((state) => state.formData);
  const { planDetailsRegistration, planDetailsLogin } = formData;
  const isAuthenticated = planDetailsRegistration?.authenticated || planDetailsLogin?.authenticated;
  if (isAuthenticated) {
    return (
      <>
        <LicensesField form={form} />
        <AuthenticatedUserField orgEmail="test@example.com" fullName="Don Schapps" />
      </>
    );
  }

  return (
    <>
      <LicensesField form={form} />
      <NameAndEmailFields form={form} />
    </>
  );
};

export default PlanDetailsContent;
