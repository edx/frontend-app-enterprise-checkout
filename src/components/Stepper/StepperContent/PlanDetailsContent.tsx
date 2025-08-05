import { AuthenticatedUserField, LicensesField, NameAndEmailFields } from '@/components/FormFields';
import useCheckoutFormStore from '@/hooks/useCheckoutFormStore';

import type { UseFormReturn } from 'react-hook-form';

interface PlanDetailsContentProps {
  form: UseFormReturn<PlanDetailsData>;
}

const PlanDetailsContent = ({ form }: PlanDetailsContentProps) => {
  const planDetails = useCheckoutFormStore((state) => state.formData.planDetails);
  const isAuthenticated = planDetails?.authenticated;
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
