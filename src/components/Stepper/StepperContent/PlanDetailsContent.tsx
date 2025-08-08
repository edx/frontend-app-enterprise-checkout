import { AuthenticatedUserField, LicensesField, NameAndEmailFields } from '@/components/FormFields';
import { PriceAlert } from '@/components/PriceAlert';
import {
  useCheckoutFormStore,
} from '@/hooks/index';

import type { UseFormReturn } from 'react-hook-form';

interface PlanDetailsContentProps {
  form: UseFormReturn<PlanDetailsData>;
}

const PlanDetailsContent = ({ form }: PlanDetailsContentProps) => {
  const isAuthenticated = useCheckoutFormStore((state) => state.isAuthenticated);
  return (
    <>
      <PriceAlert />
      <LicensesField form={form} />
      {isAuthenticated
        ? (<AuthenticatedUserField adminEmail="test@example.com" fullName="Don Schapps" />)
        : (<NameAndEmailFields form={form} />)}
    </>
  );
};

export default PlanDetailsContent;
