import { UseFormReturn } from 'react-hook-form';

import { RegistrationDisclaimer } from '@/components/Disclaimer';
import { RegisterAccountFields } from '@/components/FormFields';

interface PlanDetailsRegisterContentProps {
  form: UseFormReturn<PlanDetailsData>;
}

const PlanDetailsRegisterContent = ({ form }: PlanDetailsRegisterContentProps) => (
  <>
    <RegisterAccountFields form={form} />
    <RegistrationDisclaimer />
  </>
);

export default PlanDetailsRegisterContent;
