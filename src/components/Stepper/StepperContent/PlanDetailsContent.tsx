import { AuthenticatedUserField, LicensesField, NameAndEmailFields } from '@/components/FormFields';
import { PriceAlert } from '@/components/PriceAlert';
import useCheckoutFormStore from '@/hooks/useCheckoutFormStore';

import type { UseFormReturn } from 'react-hook-form';

interface PlanDetailsContentProps {
  form: UseFormReturn<PlanDetailsData>;
}

const PlanDetailsContent = ({ form }: PlanDetailsContentProps) => {
  const isAuthenticated = useCheckoutFormStore((state) => state.isAuthenticated);
  if (isAuthenticated) {
    return (
      <>
        <PriceAlert />
        <LicensesField form={form} />
        <AuthenticatedUserField orgEmail="test@example.com" fullName="Don Schapps" />
      </>
    );
  }

  return (
    <>
      <PriceAlert />
      <LicensesField form={form} />
      <NameAndEmailFields form={form} />
    </>
  );
};

export default PlanDetailsContent;
